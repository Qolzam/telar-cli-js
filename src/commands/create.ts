import {Args, Command, Flags} from '@oclif/core'
import * as fs from 'fs-extra'
import {got} from 'got'
import {mkdtemp, writeFile} from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import pAll from 'p-all'
import jsonFile from 'jsonfile'

import {getServicePath, gitClone} from '../helpers.js'
import SolutionService from '../pkg/common/solution.js'
import {ServiceProcess} from '../pkg/service/service.process.js'

const defaultTemplateRepository = 'https://github.com/telarpress/solutions.git'
export default class Create extends Command {
  static args = {
    solution: Args.string({
      description: 'Solution name to create a project',
      name: 'solution',
      required: true,
    }),
  }

  static description = 'Create a project from a template'

  static examples = ['$ telar create telar-social']

  static flags = {
    dir: Flags.string({char: 'd', required: false}),
    file: Flags.string({char: 'f', default: 'solution.json'}),
    git: Flags.string({char: 'g', required: false}),
    // Help
    help: Flags.help({char: 'h'}),
    output: Flags.string({char: 'o', default: '.'}),
    template: Flags.string({char: 't', required: false}),
  }

  solutionService?: SolutionService
  // properties
  solutionStatus = 'inactive'

  async closeServices(): Promise<void> {
    process.on('SIGTERM', async () => {
      if (this.solutionService) {
        await this.solutionService.stopServices()
      }
    })

    // Wait for setup to finish
    const stdin = process.openStdin()
    stdin.on('keypress', async (chunk, key) => {
      if (key && key.ctrl && key.name === 'c') {
        // stop services
        if (this.solutionService) {
          await this.solutionService.stopServices()
        }

        // TODO: Check the services are down the exit
        this.exit(0)
      }
    })
    await new Promise(() => {
      console.log('-----------------------------------------------')
      console.log('Services are running. Press ctrl+c to exit!')
      console.log('----------------------------------------------- \n\n')
    })

    const storeMicrosResponse = await got.get('https://raw.githubusercontent.com/telarpress/store/main/solutions.json')
    if (storeMicrosResponse.statusCode !== 200) {
      this.error('Could not retrieve the templates!')
    }
  }

  async run() {
    const {args, flags} = await this.parse(Create)
    const targetRepo: string = flags.git || defaultTemplateRepository
    const solutionName = args.solution
    const projectPath = path.resolve(path.join(flags.output, solutionName))
    await fs.mkdirp(projectPath)
    const solutionFilePath = path.resolve(flags.file)
    // const solutionPath = path.parse(solutionFilePath).dir
    this.log(`The project path created [${projectPath}]` )

    // whether solution file exist in the given path
    if (!(await fs.pathExists(solutionFilePath))) {
      this.error(`Solution [${solutionFilePath}] file does not exist!`)
    }

    // import solution file
    const solutionConfig = await jsonFile.readFile(solutionFilePath, {encoding: 'utf8'})
    const servicesName = Object.keys(solutionConfig.services).filter(
      (serviceName) => !solutionConfig.services[serviceName].exclude,
      )
    this.log(`The solution file imported [${solutionFilePath}]` )

    // copy services to a temporary directory
    const copyCreateDir = await mkdtemp(path.join(os.tmpdir(), 'telar-creates-' + solutionName))
    this.log('copyCreateDir', copyCreateDir)
    if (flags.dir) {
      console.log('dir: ',flags.dir)
      if (await fs.pathExists(flags.dir)) {
        await fs.copy(flags.dir, copyCreateDir)
      } else {
        this.error(`Directory [${flags.dir}] does not exist! Make sure the path is correct.`)
      }
    } else {
      try {
        await gitClone(targetRepo, copyCreateDir)
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.error(`Could not clone ${targetRepo}. ${error.message}`)
        }
      }
    }

    this.log(`The services are copied to temporary directory [${copyCreateDir}]` )

    // whether the required solution exsits in the project directory
    const servicePathExist$ = []
    for (const serviceName of servicesName) {
      servicePathExist$.push(fs.pathExists(path.join(copyCreateDir, 'templates', serviceName)))
    }

    const solutionServices = solutionConfig.services

    const servicesPathExist = await Promise.all(servicePathExist$)
    const serviceInextPathNotExist = servicesPathExist.findIndex((s) => !s)
    if (serviceInextPathNotExist > -1) {
      this.error(
        `The service [${servicesName[serviceInextPathNotExist]}] does not exist in [${flags.dir || targetRepo}].`,
      )
    }

    try {
      // copy service from temporary directory to the project directory
      const serviceCopyToSolutionRoot$ = []
      for (const serviceName of servicesName) {
        const servicePath = getServicePath(solutionServices[serviceName].worker, projectPath, serviceName)
        serviceCopyToSolutionRoot$.push(fs.copy(path.join(copyCreateDir, 'templates', serviceName), servicePath))
      }

      await Promise.all(serviceCopyToSolutionRoot$)
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.error(`Could not copy services to the project root directory [${projectPath}]. ${error.message}`)
      }
    }
    this.log(`The services are built [${projectPath}]` )

    // run setup command for all services
    const setupServices$ = []
    for (const serviceName of servicesName) {
      const servicePath = getServicePath(solutionServices[serviceName].worker, projectPath, serviceName)
      setupServices$.push(() =>
        ServiceProcess.setupService(projectPath, servicePath, solutionServices[serviceName].config),
      )
    }

    await pAll(setupServices$, {concurrency: 1})
    // write manifest content
    const manifestContent = {development: {...solutionConfig, status: 'ready'}}
    await this.writeManifest(JSON.stringify(manifestContent, null, 2), projectPath)

    this.log('=======================')
    this.log(`🎉 Services setup is done! Use commands below to start services.

$ cd ${projectPath}
$ telar solution`)
    this.log('=======================')
    this.exit(0)
  }

  async writeManifest(content: string, root: string) {
    await fs.mkdirp(path.resolve(root, '.telar'))
    const manifestPath = path.resolve(root, '.telar', 'manifest.json')
    return writeFile(manifestPath, content, {encoding: 'utf8'})
  }
}
