import {ChildProcess, exec, fork} from 'node:child_process'
import * as path from 'node:path'
import {asyncSend, logger} from '../../helpers'
import {onActionServiceStatus} from '../create/constants'
import {SET_SERVICES} from '../web-solutions/actions'
import {uiemit} from '../web-solutions/server'
import {ServiceMeta, ServiceStatus, SolutionPaths, TelarEnvironment} from './types'
import * as fs from 'fs-extra'
import evt from './events'
import * as isPortReachable from 'is-port-reachable'

export default class SolutionService {
  constructor(solutionName: string) {
    this.solutionName = solutionName
    this.telarEnv = (process.env.TELAR_ENV as TelarEnvironment) || 'development'
    this.paths = this.getSolutionPaths(solutionName)
  }

  // fields
  solutionName = ''
  paths: SolutionPaths
  solutionStatus = 'inactive'
  servicesStatus: {[key: string]: ServiceStatus} = {}
  servicesMeta: {[key: string]: ServiceMeta} = {}
  solutionRun: ChildProcess| null = null
  servicesRunProcess: {[key: string] : ChildProcess} = {}
  servicesName: Array<string> = []
  dependsOnServices: {[key: string] : Array<string>} = {}
  services: {[key:string]: any} = {}
  telarEnv: TelarEnvironment
  subSolutions: {[key:string]: any} = {}

  // methods
  loadEnvManifest(): {
    [key: string]: any;
    } {
    const telarManifest = require(this.paths.telarManifestPath)
    const currentEnvManifest = this.telarEnv === 'production' ? telarManifest.production : telarManifest.development
    this.subSolutions = currentEnvManifest.solutions && Object.keys(currentEnvManifest.solutions).length > 0 ? currentEnvManifest.solutions : null
    this.services = currentEnvManifest.services && Object.keys(currentEnvManifest.services).length > 0 ? currentEnvManifest.services : null
    return this.services
  }

  getSolutionPaths(solutionName: string) : SolutionPaths {
    const projectPath = '/Users/qolzam/projects/telar/solutions'
    const templatesPath = path.join(projectPath, 'templates')
    const solutionPath = path.join(templatesPath, solutionName)
    const solutionSetupJsPath = path.join(solutionPath, 'setup.js')
    const solutionRunJsPath = path.join(solutionPath, 'run.js')
    const dotTelarDirectoryPath = path.join(projectPath, '.telar')
    const telarManifestPath = path.join(dotTelarDirectoryPath, 'manifest.json')
    return {
      projectPath,
      templatesPath,
      solutionPath,
      solutionSetupJsPath,
      solutionRunJsPath,
      dotTelarDirectoryPath,
      telarManifestPath,
    }
  }

  // handle service status
  onServiceStatus(name: string, status: ServiceStatus) :void {
    this.servicesStatus[name] = status

    if (this.servicesName.every(serviceName => this.servicesStatus[serviceName] === 'active')) {
      this.onAllServicesActivated()
    }

    // emit services information to UI
    uiemit({
      type: SET_SERVICES,
      payload: this.servicesName.map((serviceName: string) => {
        return {
          name: serviceName,
          status: this.servicesStatus[serviceName],
          meta: this.servicesMeta[serviceName],
        }
      }),
    })

    if (status === 'active') {
      this.checkDependsOnServiceToRun()
    }
  }

  onAllServicesActivated():void {
    logger('info', 'CLI', 'all services are activated.')
    if (!this.solutionRun) {
      logger('error', 'CLI', 'solution run child process is null!')
      return
    }

    this.solutionRun.send({type: 'run', meta: {rootPath: this.paths.projectPath}})
  }

  // services message handler
  handleServiceMessage(action: any, serviceName: string):void {
    // set service meta on `ready`
    if (action.type === 'ready') {
      this.servicesMeta[serviceName] = action.meta
    }

    if (action.type === 'ready' || action.type === 'close') {
      this.onServiceStatus(serviceName, onActionServiceStatus[action.type])
    }

    if (!this.solutionRun) {
      logger('error', 'CLI', 'solution run child process is null!')
      return
    }

    this.solutionRun.on('message', (action: any) => {
      switch (action.type) {
      case 'resolved':
        evt.send(`resolved-${action.__id}`)
        break

      default:
        break
      }
    })

    this.solutionRun.send({type: 'service', payload: action.payload, meta: {rootPath: this.paths.projectPath}})
  }

  async setupSolution(): Promise<void> {
    // create .telar directory in project root
    await fs.mkdirp(this.paths.dotTelarDirectoryPath)

    // write .gitignore file
    const gitignoreContent = '.telar\ntemplates'
    await fs.writeFile(path.join(this.paths.projectPath, '.gitignore'), gitignoreContent)

    // Fork project setup.js/run.js
    const solutionSetup = fork(this.paths.solutionSetupJsPath)
    solutionSetup.on('message', (action: any) => {
      switch (action.type) {
      case 'resolved':
        evt.send(`resolved-${action.__id}`)
        break

      default:
        break
      }
    })

    // Setup project
    logger('info', 'CLI', 'Solution setup started ...')
    await asyncSend(solutionSetup, {
      type: 'setup',
      payload: {
        rootPath: this.paths.projectPath,
        devConfigPath: '/Users/qolzam/Downloads/telar-social/config.development.json',
        prodConfigPath: '/Users/qolzam/Downloads/telar-social/config.production.json',
      },
    })
    logger('info', 'CLI', 'Solution setup is done!')
  }

  async runSolution() : Promise<void> {
    this.solutionRun = fork(this.paths.solutionRunJsPath, {silent: true})

    if (this.solutionRun && this.solutionRun.stdout) {
      this.solutionRun.stdout.on('data', (data: any) => {
        logger('info', '', String(data))
      })
    }

    this.solutionRun.on('error', (err:any) => {
      logger('error', this.solutionName, '\n\t\tERROR: spawn failed! (' + err + ')')
    })

    if (this.solutionRun.stderr) {
      this.solutionRun.stderr.on('data',  (data: any) => {
        logger('info', '', String(data))
      })
    }

    this.solutionRun.on('exit', (code: string, signal: string) => {
      logger('warn', this.solutionName, `exit with code ${code} and signal ${signal} `)
    })
    this.runServices()
  }

  runServices(): void {
    const services = this.loadEnvManifest()
    // run services if any
    if (services) {
      this.servicesName =  Object.keys(services)
      const servicesToRun: Array<string> = []

      // set default status and meta info and depends_on for services
      for (const name of this.servicesName) {
        this.servicesStatus = {...this.servicesStatus, [name]: 'inactive'}
        this.servicesMeta = {...this.servicesMeta, [name]: []}
        if (services[name].depends_on && services[name].depends_on.length > 0) {
          this.dependsOnServices[name] = services[name].depends_on
        } else {
          servicesToRun.push(name)
        }
      }

      logger('info', 'CLI', 'service to run now ' + servicesToRun.join(', '))
      logger('info', 'CLI', 'service are waiting(depends_on) ' + Object.keys(this.dependsOnServices).join(', '))

      // only run the services that do no have depends_on
      for (const serviceName of servicesToRun) {
        this.runService(serviceName)
      }
    } else {
      logger('info', 'CLI', 'There is no service to run.')
    }
  }

  async stopServices() : Promise<void> {
    const stopServicesPromise: Array<Promise<any>> = []
    for (const serviceName of this.servicesName) {
      if (this.servicesRunProcess[serviceName].channel) {
        stopServicesPromise.push(asyncSend(this.servicesRunProcess[serviceName], {type: 'stop'}))
      }
    }

    await Promise.all(stopServicesPromise)
  }

  /**
   * Run a service
   * @param serviceName Service name to run
   * @return void
   */
  runService(serviceName:string): void {
    logger('info', serviceName, 'starting...')
    this.servicesStatus[serviceName] = 'activating'
    const serviceInfo: any = require(path.join(this.paths.templatesPath, serviceName, 'template.json'))
    if (serviceInfo.runCMD) {
      const servicePath = path.join(this.paths.templatesPath, serviceName)
      this.runServiceByExec(serviceName, servicePath, serviceInfo.runCMD)
    } else if (serviceInfo.runFile) {
      const runPath = path.join(this.paths.templatesPath, serviceName, serviceInfo.runFile)
      this.runServiceByFork(serviceName, runPath)
    }
  }

  checkDependsOnServiceToRun(): void {
    for (const serviceName of Object.keys(this.dependsOnServices)) {
      const dependsOn = this.dependsOnServices[serviceName]
      if (!['active', 'activating'].includes(this.servicesStatus[serviceName])  && dependsOn.every((name: string) => this.servicesStatus[name] === 'active')) {
        this.runService(serviceName)
      }
    }
  }

  runServiceByExec(serviceName:string, servicePath:string, cmd: Array<string>): void {
    this.servicesRunProcess[serviceName] = exec(
      cmd.join(' && '),
      {
        cwd: servicePath,
      },
      (err, stdout, stderr) => {
        if (err) {
          console.log(err)
        } else if (stdout) {
          console.log(stdout)
        } else if (stderr) {
          console.error(stderr)
        }
      },
    )
    if (this.servicesRunProcess && this.servicesRunProcess[serviceName] && this.servicesRunProcess[serviceName].stdout) {
            this.servicesRunProcess[serviceName].stdout!.on('data', (data: any) => {
              logger('info', serviceName, String(data))
            })
    }

    this.servicesRunProcess[serviceName].on('error', (err:any) => {
      logger('error', serviceName, '\n\t\tERROR: spawn failed! (' + err + ')')
    })

    this.servicesRunProcess[serviceName].stderr!.on('data',  (data: any) => {
      logger('info', serviceName, String(data))
    })

    this.servicesRunProcess[serviceName].on('exit', (code: string, signal: string) => {
      logger('warn', serviceName, `exit with code ${code} and signal ${signal} `)
    })

    this.servicesRunProcess[serviceName].on('message', (message: any) => this.handleServiceMessage(message, serviceName))
  }

  runServiceByFork(serviceName:string, runPath: string): void {
    this.servicesRunProcess[serviceName] = fork(runPath, {silent: true})
    if (this.servicesRunProcess && this.servicesRunProcess[serviceName] && this.servicesRunProcess[serviceName].stdout) {
            this.servicesRunProcess[serviceName].stdout!.on('data', (data: any) => {
              logger('info', serviceName, String(data))
            })
    }

    this.servicesRunProcess[serviceName].on('error', (err:any) => {
      logger('error', serviceName, '\n\t\tERROR: spawn failed! (' + err + ')')
    })

    this.servicesRunProcess[serviceName].stderr!.on('data',  (data: any) => {
      logger('info', serviceName, String(data))
    })

    this.servicesRunProcess[serviceName].on('exit', (code: string, signal: string) => {
      logger('warn', serviceName, `exit with code ${code} and signal ${signal} `)
    })

    this.servicesRunProcess[serviceName].on('message', (message: any) => this.handleServiceMessage(message, serviceName))
    logger('info', 'runServiceByFork', JSON.stringify(this.services[serviceName]))
    this.servicesRunProcess[serviceName].send({type: 'run', payload: {
      rootPath: this.paths.projectPath,
      config: this.services[serviceName].config,
    }})
  }
}
