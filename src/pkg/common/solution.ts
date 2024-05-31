/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs-extra'
import {ChildProcess, fork} from 'node:child_process'
import {writeFile} from 'node:fs/promises'
import * as path from 'node:path'

import {asyncSend, logger} from '../../helpers.js'
import {readJsonFile} from '../jsonfile.js'
import {ServiceCache} from '../service/service.cache.js'
import {SET_SERVICES} from '../web-solutions/actions.js'
import {uiemit} from '../web-solutions/server.js'
import evt from './events.js'
import {canUsePort} from './network.js'
import {ServiceMeta, ServiceStatus, SolutionPaths, TelarEnvironment} from './types.js'

export default class SolutionService {
  dependsOnServices: {[key: string]: Array<string>} = {}

  paths: SolutionPaths
  servicesMeta: {[key: string]: ServiceMeta} = {}
  servicesName: Array<string> = []
  servicesRunProcess: {[key: string]: ChildProcess} = {}
  servicesStatus: {[key: string]: ServiceStatus} = {}
  // fields
  solutionName = ''
  solutionRun: ChildProcess | null = null
  solutionStatus = 'inactive'
  subSolutions: {[key: string]: any} = {}
  telarEnv: TelarEnvironment
  constructor(solutionName: string) {
    this.solutionName = solutionName
    this.telarEnv = (process.env.TELAR_ENV as TelarEnvironment) || 'dev'
    this.paths = this.getSolutionPaths(solutionName)
  }

  checkDependsOnServiceToRun(): void {
    for (const serviceName of Object.keys(this.dependsOnServices)) {
      const dependsOn = this.dependsOnServices[serviceName]
      if (
        !['activating', 'active'].includes(this.servicesStatus[serviceName]) &&
        dependsOn.every((name: string) => this.servicesStatus[name] === 'active')
      ) {
        // TODO: code commented
        // this.runService(serviceName)
      }
    }
  }

  async checkSubsolutionPorts(): Promise<{[x: string]: boolean}> {
    const portPromises = []
    const indexKey: {[key: number]: string} = {}
    for (const [index, key] of Object.keys(this.subSolutions).entries()) {
      const solution = this.subSolutions[key]
      indexKey[index] = key
      if (solution.ports && solution.ports.length > 0) {
        for (const port of solution.ports) {
          portPromises.push(canUsePort(port))
        }
      }
    }

    const result = await Promise.all(portPromises)
    let mappedPortsStatus = {}
    for (const [index, inUsed] of result.entries()) {
      mappedPortsStatus = {...mappedPortsStatus, [indexKey[index]]: inUsed}
    }

    return mappedPortsStatus
  }

  getSolutionPaths(solutionName: string): SolutionPaths {
    const projectPath = '/Users/qolzam/projects/telar/solutions'
    const templatesPath = path.join(projectPath, 'templates')
    const solutionPath = path.join(templatesPath, solutionName)
    const solutionSetupJsPath = path.join(solutionPath, 'setup.js')
    const solutionRunJsPath = path.join(solutionPath, 'run.js')
    const dotTelarDirectoryPath = path.join(projectPath, '.telar')
    const telarManifestPath = path.join(dotTelarDirectoryPath, 'manifest.json')
    return {
      dotTelarDirectoryPath,
      projectPath,
      solutionPath,
      solutionRunJsPath,
      solutionSetupJsPath,
      telarManifestPath,
      templatesPath,
    }
  }

  // methods
  async loadEnvManifest(): Promise<{
    services: {
      [key: string]: any
    }
    subSolutions: {
      [key: string]: any
    }
  }> {
    const telarManifest = (await readJsonFile(this.paths.telarManifestPath, {encoding: 'utf8'})) as any
    const currentEnvManifest = this.telarEnv === 'production' ? telarManifest.production : telarManifest.development
    this.subSolutions =
      currentEnvManifest.solutions && Object.keys(currentEnvManifest.solutions).length > 0
        ? currentEnvManifest.solutions
        : null
    if (currentEnvManifest.services && Object.keys(currentEnvManifest.services).length > 0) {
      for (const name of Object.keys(currentEnvManifest.services)) {
        ServiceCache.setService(name, currentEnvManifest.services[name])
      }
    }

    return {services: currentEnvManifest.services, subSolutions: this.subSolutions}
  }

  onAllServicesActivated(): void {
    logger('info', 'CLI', 'all services are activated.')
    if (!this.solutionRun) {
      logger('error', 'CLI', 'solution run child process is null!')
      return
    }

    this.solutionRun.send({meta: {rootPath: this.paths.projectPath}, type: 'run'})
  }

  // handle service status
  onServiceStatus(name: string, status: ServiceStatus): void {
    this.servicesStatus[name] = status

    if (this.servicesName.every((serviceName) => this.servicesStatus[serviceName] === 'active')) {
      this.onAllServicesActivated()
    }

    // emit services information to UI
    uiemit({
      payload: this.servicesName.map((serviceName: string) => ({
        meta: this.servicesMeta[serviceName],
        name: serviceName,
        status: this.servicesStatus[serviceName],
      })),
      type: SET_SERVICES,
    })

    if (status === 'active') {
      this.checkDependsOnServiceToRun()
    }
  }

  async runServices(): Promise<{services: {[key: string]: any}; subSolutions: {[key: string]: any}}> {
    const {services, subSolutions} = await this.loadEnvManifest()
    const portsStatus = await this.checkSubsolutionPorts()
    console.log('portsStatus', JSON.stringify(portsStatus, null, 2))
    if (Object.values(portsStatus).includes(true)) {
      throw new Error(
        'All ports must be available for app. Please check in-used ports and make it available for app.' +
          JSON.stringify(portsStatus, null, 2),
      )
    } else {
      return {services: {}, subSolutions: {}}
    }

    // run services if any
    if (services) {
      this.servicesName = Object.keys(services)
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
      // TODO: Commented
      // for (const serviceName of servicesToRun) {
      //   ServiceProcess.runService(serviceName,)
      // }
    } else {
      logger('info', 'CLI', 'There is no service to run.')
    }

    return {services, subSolutions}
  }

  async runSolution(): Promise<void> {
    this.solutionRun = fork(this.paths.solutionRunJsPath, {silent: true})

    if (this.solutionRun && this.solutionRun.stdout) {
      this.solutionRun.stdout.on('data', (data: any) => {
        logger('info', '', String(data))
      })
    }

    this.solutionRun.on('error', (err: any) => {
      logger('error', this.solutionName, '\n\t\tERROR: spawn failed! (' + err + ')')
    })

    if (this.solutionRun.stderr) {
      this.solutionRun.stderr.on('data', (data: any) => {
        logger('info', '', String(data))
      })
    }

    this.solutionRun.on('exit', (code: string, signal: string) => {
      logger('warn', this.solutionName, `exit with code ${code} and signal ${signal} `)
    })
    this.runServices()
  }

  async setupSolution(): Promise<void> {
    // create .telar directory in project root
    await fs.mkdirp(this.paths.dotTelarDirectoryPath)

    // write .gitignore file
    const gitignoreContent = '.telar\ntemplates'
    await writeFile(path.join(this.paths.projectPath, '.gitignore'), gitignoreContent)

    // Fork project setup.js/run.js
    const solutionSetup = fork(this.paths.solutionSetupJsPath)
    solutionSetup.on('message', (action: any) => {
      switch (action.type) {
        case 'resolved': {
          evt.send(`resolved-${action.__id}`)
          break
        }

        default: {
          break
        }
      }
    })

    // Setup project
    logger('info', 'CLI', 'Solution setup started ...')
    await asyncSend(solutionSetup, {
      payload: {
        devConfigPath: '/Users/qolzam/Downloads/telar-social/config.development.json',
        prodConfigPath: '/Users/qolzam/Downloads/telar-social/config.production.json',
        rootPath: this.paths.projectPath,
      },
      type: 'setup',
    })
    logger('info', 'CLI', 'Solution setup is done!')
  }

  async stopServices(): Promise<void> {
    const stopServicesPromise: Array<Promise<any>> = []
    for (const serviceName of this.servicesName) {
      if (this.servicesRunProcess[serviceName].channel) {
        stopServicesPromise.push(asyncSend(this.servicesRunProcess[serviceName], {type: 'stop'}))
      }
    }

    await Promise.all(stopServicesPromise)
  }
}
