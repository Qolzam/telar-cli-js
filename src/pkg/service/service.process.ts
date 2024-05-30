import * as fs from 'fs-extra'
import {ForkOptions, exec, fork} from 'node:child_process'
import {readFile, writeFile} from 'node:fs/promises'
import * as path from 'node:path'
import jsonFile from 'jsonfile'

import {asyncSend, gitClone, logger} from '../../helpers.js'
import evt from '../common/events.js'
import {ServiceCache} from './service.cache.js'
import {ServiceTemplate} from './service.types.js'
import {getVmScript} from './vm.service.call.js'

interface ServiceConfig {
  [key: string]: string
}

export const ServiceProcess = {
  async callService(
    projectPath: string,
    root: string,
    callMethod: 'run' | 'setup',
    config: ServiceConfig,
  ): Promise<void> {
    const serviceTemplate: ServiceTemplate = await this.getServiceTemplate(root)
    const serviceName = serviceTemplate.name
    logger('info', serviceName, `starting ${callMethod}...`)

    if (serviceTemplate.repositories.length > 0 && callMethod === 'setup') {
      const cloneList$: Promise<void>[] = []
      for (const repo of serviceTemplate.repositories) {
        cloneList$.push(gitClone(repo.url, path.join(projectPath, repo.name)))
      }

      await Promise.all(cloneList$)
    }

    ServiceCache.setService(serviceName, {})
    ServiceCache.setServiceConfig(serviceName, config)
    ServiceCache.setServiceStatus(serviceName, 'activating')
    const {content, syntax} = this.detectCmdOrFileSyntax(serviceTemplate, callMethod)
    if (syntax === 'cmd') {
      const servicePath = root
      return this.callServiceByExec(serviceName, servicePath, content)
    }

    if (syntax === 'file') {
      const runPath = path.resolve(path.join(root, content))
      const runFileName = path.basename(content)
      const vm = await this.createVmScript(path.parse(runPath).dir, runFileName)
      return this.callServiceByFork(serviceName, projectPath, vm.path, root)
    }
  },
  callServiceByExec(serviceName: string, servicePath: string, cmd: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const serviceProcess = exec(
        cmd,
        {
          cwd: servicePath,
          windowsHide: true,
        },
        (err, stdout, stderr) => {
          if (err) {
            logger('error', serviceName, `Error occurred:`)
            console.log(err.message)
            reject(err)
          } else if (stdout) {
            logger('info', serviceName, `Stdout: ${stdout}`)
          } else if (stderr) {
            logger('info', serviceName, `Stderr: ${stderr}`)
          }
        },
      )
      if (serviceProcess.stdout) {
        serviceProcess.stdout.on('data', (data: string) => {
          logger('info', serviceName, '')
          console.log(String(data))
        })
      }

      serviceProcess.on('error', (err: Error) => {
        logger('error', serviceName, `Error occurred:`)
        console.log(err)

        reject(err)
      })

      serviceProcess.stderr?.on('data', (data: string) => {
        logger('info', serviceName, '')
        console.log(String(data))
      })

      serviceProcess.on('exit', (code: null | number, signal: null | string) => {
        if (code === 0 && signal === null) {
          resolve()
          logger('info', serviceName, 'Finished the job successfully!')
        } else {
          reject(new Error(`Exit with code ${code} and signal ${signal}`))
          logger('warn', serviceName, `Exit with code ${code} and signal ${signal}`)
        }
      })

      serviceProcess.on('message', (message: Record<string, unknown>) =>
        this.handleServiceMessage(message, serviceName),
      )

      ServiceCache.setProcess(serviceName, serviceProcess)
    })
  },

   verifyAndFixURL(url:string) {
    // Check if the URL starts with a valid scheme or is a relative path
    if (!/^file:|^\/|^\.\./.test(url)) {
      // Invalid URL format, prepend with 'file://' scheme
      url = 'file://' + url;
    }
    return url;
  },
  
  callServiceByFork(serviceName: string, projectPath: string, runPath: string, cwd?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const options: ForkOptions = {cwd, silent: true}
      const serviceProcess = fork(runPath, options)
      if (serviceProcess.stdout) {
        serviceProcess.stdout.on('data', (data: string) => {
          logger('info', serviceName, '')
          console.log(String(data))
        })
      }

      serviceProcess.on('error', (err: Error) => {
        logger('error', serviceName, `Error occurred:`)
        console.log(err.message)
        reject(err)
      })

      serviceProcess.stderr?.on('data', (data: string) => {
        logger('info', serviceName, '')
        console.log(String(data))
      })

      serviceProcess.on('exit', (code: null | number, signal: null | string) => {
        reject(new Error(`Exit with code ${code} and signal ${signal}`))
        logger('warn', serviceName, `Exit with code ${code} and signal ${signal}`)
      })

      serviceProcess.on('message', (message: Record<string, unknown>) =>
        this.handleServiceMessage(message, serviceName),
      )
      const config = ServiceCache.getConfig(serviceName)

      asyncSend(serviceProcess, {
        payload: {
          config,
          projectPath,
          rootPath: path.parse(runPath).dir,
        },
        type: 'run',
      })
        .catch((error: Error) => {
          logger('error', 'callServiceByFork', `Error on forking ${serviceName} ${error.message}`)
          reject(error)
        })
        .then(() => {
          resolve()
        })
      ServiceCache.setProcess(serviceName, serviceProcess)
    })
  },

  async createVmScript(filePath: string, fileName: string) {
    const sourceFilePath = path.join(filePath, fileName)
    const sourceContent = await readFile(sourceFilePath, {encoding: 'utf8'})
    const vmContent =
      sourceContent +
      `\n// ================ VM Auto Generated ================
    ${getVmScript()}
    `
    const vmFilePath = path.join(filePath, 'vm.' + fileName)
    await writeFile(vmFilePath, vmContent, {encoding: 'utf8'})
    return {path: vmFilePath}
  },

  detectCmdOrFileSyntax(template: ServiceTemplate, field: 'run' | 'setup') {
    const isCmd = template[field].startsWith('cmd:')
    const isFile = template[field].startsWith('file:')
    if (!isCmd && !isFile) {
      throw new Error('Setup field is not valid. Setup should start with the "cmd:" or "file:" word.')
    }

    return isCmd
      ? {content: template[field].slice(4), syntax: 'cmd'}
      : {content: template[field].slice(5), syntax: 'file'}
  },

  async getServiceTemplate(root: string) {
    const rootServicePath = path.resolve(root)
    const serviceTemplatePath = path.join(rootServicePath, 'template.json')
    const serviceTemplatePathExist = await fs.pathExists(serviceTemplatePath)
    if (!serviceTemplatePathExist) {
      throw new Error(
        'Could not find service template. Make sure you have `template.json` in your service root directory.',
      )
    }

    return jsonFile.readFile(serviceTemplatePath, {encoding: 'utf8'})
  },

  handleServiceMessage(action: Record<string, unknown>, serviceName: string): void {
    if (action.type === 'reject') {
      logger('error', `${serviceName}:rejected`, JSON.stringify(action.payload))
    }

    if (action.type === 'resolve') {
      ServiceCache.setServiceStatus(serviceName, 'active')
      evt.send(`resolved-${action.__id}`, action)
      if (action.payload) {
        logger('info', `${serviceName}:ready`, (action.payload as Record<string, string>).log)
      }
    }
  },

  runService(projectPath: string, root: string, config: ServiceConfig): Promise<void> {
    return this.callService(projectPath, root, 'run', config)
  },

  setupService(projectPath: string, root: string, config: ServiceConfig): Promise<void> {
    return this.callService(projectPath, root, 'setup', config)
  },

  async stopServices(): Promise<void> {
    const stopServicesPromise: Array<Promise<unknown>> = []
    const services = ServiceCache.getServices()
    if (services && Object.keys(services).length > 0) {
      const allServices = Object.keys(services)
      for (const serviceName of allServices) {
        const serviceProcess = services[serviceName].process
        if (serviceProcess && serviceProcess.channel) {
          stopServicesPromise.push(asyncSend(serviceProcess, {type: 'stop'}))
        }
      }

      await Promise.all(stopServicesPromise)
    }
  },
}
