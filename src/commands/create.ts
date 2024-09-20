/* eslint-disable @typescript-eslint/no-explicit-any */
import {Args, Command, Flags} from '@oclif/core'
import * as fs from 'fs-extra'
import {mkdtemp, writeFile} from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import pAll from 'p-all'
import prompt from 'prompts'

import {getServicePath, gitDownload, logger} from '../helpers.js'
import SolutionService from '../pkg/common/solution.js'
import {readJsonFile} from '../pkg/jsonfile.js'
import {ServiceProcess} from '../pkg/service/service.process.js'

const defaultTemplateRepository = 'https://github.com/telarpress/solutions.git'
const defaultStoreRepository = 'https://github.com/telarpress/store.git'
const solutionRepositoryName = 'solutions'
const solutionJsonFileName = 'solution.json'

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
    dir: Flags.string({char: 'd', description: 'Aternative direcoty to telar solutions repository', required: false}),
    file: Flags.string({
      char: 'f',
      description: 'Alternative to default telar store repository. The path example `path/to/solution.json`',
    }),
    git: Flags.string({char: 'g', required: false}),
    // Help
    help: Flags.help({char: 'h'}),
    output: Flags.string({char: 'o', default: '.'}),
    template: Flags.string({char: 't', required: false}),
  }

  solutionService?: SolutionService
  // properties
  solutionStatus = 'inactive'

  async cloneStore(targetRepo: string, copyCreateDir: string) {
    try {
      await gitDownload(targetRepo, copyCreateDir)
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.error(`Could not clone ${targetRepo}. ${error.message}`)
      }
    }
  }

  async cloneTemplates(targetRepo: string, copyCreateDir: string) {
    try {
      await gitDownload(targetRepo, copyCreateDir)
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.error(`Could not clone ${targetRepo}. ${error.message}`)
      }
    }
  }

  /**
   * Get solution file path
   * @param copyCreateDir target directory to copy all solutions
   * @param solutionName solution name to get from store
   * @param file custom file path selected
   * @returns {string} solution file path
   */
  async getSolutionFilePath(copyCreateDir: string, solutionName: string, file?: string) {
    let solutionFilePath = null
    if (file) {
      solutionFilePath = path.resolve(file)
    } else {
      if (!solutionName) {
        this.error('Solution name is required. Example: `$ telar create telar-social` ')
      }

      await this.cloneStore(defaultStoreRepository, copyCreateDir)
      solutionFilePath = path.join(copyCreateDir, solutionRepositoryName, solutionName, solutionJsonFileName)
    }

    if (!solutionFilePath) {
      this.error(`The solution file path could not be recognized. The path [${solutionFilePath}]`)
    }

    // whether solution file exist in the given path
    if (!(await fs.pathExists(solutionFilePath))) {
      this.error(
        `Solution "${solutionName}" does not exist. Make sure the solution name is correct or exist in the sore. The path [${solutionFilePath}] file does not exist!`,
      )
    }

    return solutionFilePath
  }

  async run() {
    try {
      await this.setupRun()
    } catch (error) {
      if (error instanceof Error) {
        this.error(error)
      } else {
        console.error(error)
      }
    }
  }

  async selectServices(servicesName: Array<string>) {
    const {selectedServices} = await prompt({
      choices: servicesName.map((serviceName) => ({title: serviceName, value: serviceName})),
      message: 'Select services to create',
      name: 'selectedServices',
      type: 'multiselect',
    })
    return selectedServices
  }

  async setupRun() {
    const {args, flags} = await this.parse(Create)
    const targetRepo: string = flags.git || defaultTemplateRepository
    const solutionName = args.solution
    const projectPath = path.resolve(path.join(flags.output, solutionName))

    // create a temporary directory
    const copyCreateDir = await mkdtemp(path.join(os.tmpdir(), 'telar-create-' + solutionName))

    logger('info', 'create', `Fetching solution file.`)
    const solutionFilePath = await this.getSolutionFilePath(copyCreateDir, solutionName, flags.file)
    logger('info', 'create', `Solution file is fetched.`)

    // create the project directory
    await fs.mkdirp(projectPath)
    // const solutionPath = path.parse(solutionFilePath).dir
    logger('info', 'create', `The project path created [${projectPath}]`)

    // import solution file
    let solutionConfig = {} as {[key: string]: any}
    let servicesName: Array<string> = []
    try {
      solutionConfig = await readJsonFile(solutionFilePath, {encoding: 'utf8'})
      servicesName = Object.keys(solutionConfig.services).filter(
        (serviceName) => !solutionConfig.services[serviceName].exclude,
      )
    } catch (error) {
      if (error instanceof Error) {
        this.log(`Error while reading solution file from ${solutionFilePath}`)
        this.error(error)
      } else {
        console.error(error)
        this.exit(1)
      }
    }

    logger('info', 'create', `The solution file imported [${solutionFilePath}]`)

    // copy services to a temporary directory
    if (flags.dir) {
      if (await fs.pathExists(flags.dir)) {
        await fs.copy(flags.dir, copyCreateDir)
      } else {
        this.error(`Directory [${flags.dir}] does not exist! Make sure the path is correct.`)
      }
    } else {
      await this.cloneTemplates(targetRepo, copyCreateDir)
    }

    logger('info', 'create', `The services are copied to temporary directory [${copyCreateDir}]`)

    // whether the required solution exsits in the project directory
    const servicePathExist$ = []
    for (const serviceName of servicesName) {
      servicePathExist$.push(fs.pathExists(path.join(copyCreateDir, 'templates', serviceName)))
    }

    const servicesPathExist = await Promise.all(servicePathExist$)
    const serviceInextPathNotExist = servicesPathExist.findIndex((s) => !s)
    if (serviceInextPathNotExist > -1) {
      this.error(
        `The service [${servicesName[serviceInextPathNotExist]}] does not exist in [${flags.dir || targetRepo}].`,
      )
    }

    // display a prompt to select the services by user
    const selectedServices = await this.selectServices(servicesName)
    if (!selectedServices) {
      this.error('No services selected')
    }

    // filter `solutionConfig.services` by `selectedServices` and map as an object
    const solutionServices: {[key: string]: any} = {}
    for (const serviceName of selectedServices) {
      solutionServices[serviceName] = solutionConfig.services[serviceName]
    }

    solutionConfig.services = {...solutionServices}
    try {
      // copy service from temporary directory to the project directory
      const serviceCopyToSolutionRoot$ = []
      for (const serviceName of selectedServices) {
        const servicePath = getServicePath(solutionServices[serviceName].worker, projectPath, serviceName)
        serviceCopyToSolutionRoot$.push(fs.copy(path.join(copyCreateDir, 'templates', serviceName), servicePath))
      }

      await Promise.all(serviceCopyToSolutionRoot$)
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.error(`Could not copy services to the project root directory [${projectPath}]. ${error.message}`)
      }
    }

    logger('info', 'create', `The services are built [${projectPath}]`)

    // run setup command for all services
    const setupServices$ = []
    for (const serviceName of selectedServices) {
      const servicePath = getServicePath(solutionServices[serviceName].worker, projectPath, serviceName)
      setupServices$.push(() =>
        ServiceProcess.setupService(projectPath, servicePath, solutionServices[serviceName].config),
      )
    }

    await pAll(setupServices$, {concurrency: 1})
    // write manifest content
    const manifestContent = {
      development: {...solutionConfig, status: 'ready'},
      solutionName,
      solutionPath: flags.dir || targetRepo,
      solutionPathType: flags.dir ? 'local' : 'remote',
    }
    await this.writeManifest(JSON.stringify(manifestContent, null, 2), projectPath)

    // remove temp directory
    await fs.remove(copyCreateDir)
    this.log('=======================')
    this.log(`🎉 Services setup is done! Use commands below to start services.
$ cd ${solutionName}
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
