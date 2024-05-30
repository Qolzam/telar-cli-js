import {Command, Flags} from '@oclif/core'
import * as fs from 'fs-extra'
import * as path from 'node:path'
import pAll from 'p-all'
import jsonFile from 'jsonfile'

import {getServicePath} from '../helpers.js'
import {ServiceProcess} from '../pkg/service/service.process.js'
const defaultTelarEnv = 'development'

export default class Solution extends Command {
  static description = 'Manage solutions'

  static examples = ['$ telar solution']

  static flags = {
    // Help
    help: Flags.help({char: 'h'}),
  }

  // methods
  async loadEnvManifest(root: string) {
    const manifestPath = path.join(root, '.telar', 'manifest.json')
    if (!(await fs.pathExists(manifestPath))) {
      throw new Error(`Could not find telar manifest in ${manifestPath} `)
    }

    const telarManifest: Record<string, unknown> = await jsonFile.readFile(path.resolve(root, '.telar', 'manifest.json'), {encoding:'utf8'})
    return telarManifest
  }

  async run() {
    const currentEnv = process.env.TELAR_ENV || defaultTelarEnv
    const projectPath = path.resolve('./')

    // load telar manifest
    let manifest: Record<string, unknown> = {}
    try {
      manifest = await this.loadEnvManifest(projectPath)
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.error(`Could not load manifest in "${projectPath}"`)
      }
    }

    const {services} = manifest[currentEnv] as {
      services: {[key: string]: {config: {[key: string]: string}; worker: boolean}}
    }
    const servicesName = Object.keys(services)
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.log(error.message)
      }
    }

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
