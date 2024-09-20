import {Args, Command, Flags} from '@oclif/core'
import * as fs from 'fs-extra'
import {mkdtemp} from 'node:fs/promises'
import os from 'node:os'
import * as path from 'node:path'
import pAll from 'p-all'
import prompt from 'prompts'

import {getServicePath, gitDownload} from '../helpers.js'
import {readJsonFile} from '../pkg/jsonfile.js'
import {ServiceProcess} from '../pkg/service/service.process.js'
const defaultTelarEnv = 'development'

// Constants
const defaultTemplateRepository = 'https://github.com/telarpress/solutions.git'

export default class Solution extends Command {
  // args = [{command: 'recreate'}, {service: 'service_name'}].
  // recreate: remove the target service
  // service: the service name to recreate
  static args = {
    command: Args.string({description: 'Command to run', required: false}),
    service: Args.string({description: 'Service name', required: false}),
  }

  static description = 'Manage solutions'

  static examples = ['$ telar solution']

  static flags = {
    exclude: Flags.string({default: [], description: 'exclude a service', multiple: true}),
    // Help
    help: Flags.help({char: 'h'}),
  }

  // methods
  async loadEnvManifest(root: string) {
    const manifestPath = path.join(root, '.telar', 'manifest.json')
    if (!(await fs.pathExists(manifestPath))) {
      throw new Error(`Could not find telar manifest in ${manifestPath} `)
    }

    const telarManifest: Record<string, unknown> = await readJsonFile(path.resolve(root, '.telar', 'manifest.json'), {
      encoding: 'utf8',
    })
    return telarManifest
  }

  async recreateService(
    manifest: Record<string, unknown>,
    currentEnv: string,
    projectPath: string,
    serviceName?: string,
  ) {
    if (!serviceName) {
      this.error('Service name is required')
    }

    // prompt a question to confirm the action
    const {confirm} = await prompt({
      initial: true,
      message: 'Are you sure you want to recreate the service?',
      name: 'confirm',
      type: 'confirm',
    })
    if (!confirm) {
      return
    }

    const {services} = manifest[currentEnv] as {
      services: {[key: string]: {config: {[key: string]: string}; worker: boolean}}
    }
    const service = services[serviceName]
    if (!service) {
      this.error(`Service [${serviceName}] does not exist in the manifest`)
    }

    const servicePath = getServicePath(service.worker, projectPath, serviceName)
    await fs.remove(servicePath)
    this.log(`Service [${serviceName}] removed from [${projectPath}]`)

    // download the solutions from `defaultTemplateRepository` in temporary directory
    const copyCreateDir = await mkdtemp(path.join(os.tmpdir(), 'telar-recreate-' + serviceName))
    await gitDownload(defaultTemplateRepository, copyCreateDir)

    // copy service from temporary directory to the project directory
    const serviceCopyToSolutionRoot$ = []
    serviceCopyToSolutionRoot$.push(fs.copy(path.join(copyCreateDir, 'templates', serviceName), servicePath))

    await Promise.all(serviceCopyToSolutionRoot$)
    this.log(`Service [${serviceName}] copied to [${projectPath}]`)

    // run setup command for all service
    const setupServices$ = []
    setupServices$.push(() => ServiceProcess.setupService(projectPath, servicePath, service.config))

    await pAll(setupServices$, {concurrency: 1})
    this.log(`Service [${serviceName}] setup is done!`)

    // remove temp directory
    await fs.remove(copyCreateDir)
    this.log('-------------------------------------------')
    this.log(`🎉 Service [${serviceName}] setup is done!`)
    this.log('-------------------------------------------')

    const {confirmRun} = await prompt({
      initial: true,
      message: 'Do you want to run the solution?',
      name: 'confirmRun',
      type: 'confirm',
    })
    if (confirmRun) {
      await this.runSolution(manifest, currentEnv, projectPath)
    }

    this.exit(0)
  }

  async run() {
    const currentEnv = process.env.TELAR_ENV || defaultTelarEnv
    const projectPath = path.resolve('./')
    const {flags} = await this.parse(Solution)

    // load telar manifest
    let manifest: Record<string, unknown> = {}
    try {
      manifest = await this.loadEnvManifest(projectPath)
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.error(`Could not load manifest in "${projectPath}"`)
      }
    }

    // check args
    // if the arge command is not provided or it equals to `run` , run the solution
    // otherwise, run the command
    const {args} = await this.parse(Solution)
    if (!args.command || args.command === 'run') {
      await this.runSolution(manifest, currentEnv, projectPath, flags.exclude)
    } else if (args.command === 'recreate') {
      await this.recreateService(manifest, currentEnv, projectPath, args.service)
    }
  }

  async runSolution(
    manifest: Record<string, unknown>,
    currentEnv: string,
    projectPath: string,
    exclude: string[] = [],
  ) {
    const {services} = manifest[currentEnv] as {
      services: {[key: string]: {config: {[key: string]: string}; worker: boolean}}
    }
    const servicesName = Object.keys(services).filter((s) => !exclude.includes(s))
    const servicePathExist$ = []
    for (const serviceName of servicesName) {
      const servicePath = getServicePath(services[serviceName].worker, projectPath, serviceName)
      servicePathExist$.push(fs.pathExists(servicePath))
    }

    const servicesPathExist = await Promise.all(servicePathExist$)
    const serviceInextPathNotExist = servicesPathExist.findIndex((s) => !s)
    if (serviceInextPathNotExist > -1) {
      this.error(`The service [${servicesName[serviceInextPathNotExist]}] does not exist in [${projectPath}].`)
    }

    process.on('SIGTERM', async () => {
      await ServiceProcess.stopServices()
      this.log('All services SIGTERM by [exit]')
    })
    process.on('exit', async () => {
      await ServiceProcess.stopServices()
      this.log('All services stopped by [exit]')
    })

    const runServices$ = []
    for (const serviceName of servicesName) {
      const servicePath = getServicePath(services[serviceName].worker, projectPath, serviceName)
      runServices$.push(() => ServiceProcess.runService(projectPath, servicePath, services[serviceName].config))
    }

    try {
      await pAll(runServices$, {concurrency: 1})
      this.log('-------------------------------------------')
      this.log('🔥 All Services are running!')
      this.log('-------------------------------------------')
      await this.waitForClose()
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.log(error.message)
      }
    }
  }

  async waitForClose() {
    // Wait for setup to finish
    const stdin = process.openStdin()
    stdin.on('keypress', async (chunk, key) => {
      if (key && key.ctrl && key.name === 'c') {
        // stop services
        await ServiceProcess.stopServices()
        this.log('All services stopped by [keypress]')

        // TODO: Check the services are down the exit
        this.exit(0)
      }
    })
    await new Promise(() => {
      this.log('-------------------------------------------')
      console.log('Press ctrl+c to exit!')
      this.log('-------------------------------------------')
    })
  }
}
