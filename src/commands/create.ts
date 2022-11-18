import {Command, Flags} from '@oclif/core'
import * as shell from 'shelljs'
import * as fs from 'fs-extra'
import * as path from 'node:path'
import * as os from 'node:os'
import got from 'got'
import {Store} from '../pkg/create/store-type'
import {getServer} from '../pkg/web-solutions/server'
import {SOLUTION_START} from '../pkg/web-solutions/actions'
import * as open from 'open'
import SolutionService from '../pkg/common/solution'

const defaultTemplateRepository = 'https://github.com/Qolzam/creates.git'
export default class Create extends Command {
  static description = 'Create a project template';
  static examples = [
    '$ telar create telar-social',
    '$ telar create telar-social --template="telar-social-raw"',
    '$ telar create telar-social --template="telar-social-raw" --output ./path/to/output',
  ];

  static flags = {
    // Help
    help: Flags.help({char: 'h'}),
    template: Flags.string({char: 't', required: false}),
    config: Flags.string({char: 'c', default: './conf.yml'}),
    output: Flags.string({char: 'o', default: '.'}),
  };

  static args = [
    {
      name: 'solution',
      required: true,
      description: 'Solution name to start a project',
    },
  ];

  // properties
  solutionStatus = 'inactive'
  solutionService?: SolutionService

  async run() {
    const {args, flags} = await this.parse(Create)
    let targetRepo : string |null = null
    if (args.arg1 === 'pull') {
      targetRepo = args.arg2
    }

    let templateName: string |null = null
    if (flags.template) {
      templateName = flags.template
    }

    // dispatch actions from UI
    const dispatcher = (action: any) => {
      switch (action.type) {
      case SOLUTION_START:
        this.startSolution(templateName, targetRepo)
        break

      default:
        break
      }
    }

    const server = getServer(dispatcher, () => {
      if (this.solutionStatus === 'inactive') {
        this.startSolution(templateName, targetRepo)
      }
    })
    const port = 3001
    server.listen(port)
    open('http:localhost:' + port)
    await new Promise(() => {
      console.log('-----------------------------------------------')
      console.log('Service is running. Press ctrl+c to exit!')
      console.log('----------------------------------------------- \n\n')
    })
  }

  async startSolution(inputTemplateName: string| null, inputTargetRepo: string| null) : Promise<void> {
    // change solution status
    this.solutionStatus = 'running'

    const solutionName = 'ts-ui-encore'
    this.solutionService = new SolutionService(solutionName)
    await this.solutionService.setupSolution()
    await this.solutionService.runSolution()

    process.on('SIGTERM', async () => {
      if (this.solutionService) {
        await this.solutionService.stopServices()
      }
    })

    // Wait for setup to finish
    const stdin = process.openStdin()
    stdin.on('keypress', async (chunk, key) =>  {
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

    if (!shell.which('git')) {
      this.error(
        'Sorry, git command does not exist! Please install git and run this command again.',
      )
    }

    const storeMicrosResponse = await got.get(
      'https://raw.githubusercontent.com/telarpress/store/main/solutions.json',
    )
    if (storeMicrosResponse.statusCode !== 200) {
      this.error('Could not retrieve the templates!')
    }

    const storeMicros = JSON.parse(storeMicrosResponse.body) as Store
    // const solutionName = args.solution
    const solution = storeMicros.solutions.find(s => s.name === solutionName)
    if (!solution) {
      this.error(`Could not find the "${solutionName}" solution`)
    }

    let templateName = solution.defaultTemplate
    if (inputTemplateName) {
      templateName = inputTemplateName
    }

    if (!solution.templates[templateName]) {
      const allTemplates = Object.keys(solution.templates).join('\n')
      this.error(
        `Can not find the template "${templateName}". Please check the template name if there is any typo\n` +
      allTemplates,
      )
    }

    let targetRepo = defaultTemplateRepository
    if (inputTargetRepo) {
      targetRepo = inputTargetRepo
    }

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'telar-creates-'))

    await this.gitClone(targetRepo, tmpDir)

    const createPath = path.join(tmpDir, 'create')
    const createPathExist = await fs.pathExists(createPath)
    if (!createPathExist) {
      this.error('Can not find create directory in fetched repository!')
    }

    const currentDirectory = shell.pwd().stdout
    const targetPath = path.join(currentDirectory, 'create')
    shell.cp('-R', createPath, targetPath)
    const createDirs = shell.ls(targetPath)
    this.log(
      `Fetched ${createDirs.length} creates(s) : [ ${createDirs.join(', ')} ]`,
    )

    // Install solutions

    // Copy services

    // Install services

    // Fork setup.js

    // If [--run] flag , run the services then solutions
    // Fork run.js
  }

  async gitClone(targetRepo: string, dir: string): Promise<void> {
    this.log('Fetch creates from repository: ', targetRepo)
    const cloneCommand = `git clone --quiet ${defaultTemplateRepository} ${dir}`
    if (shell.exec(cloneCommand).code !== 0) {
      this.error('Error: Git clone failed')
    }
  }

  /**
   * Copy services to project directory
   * @param serviceNameList List of services name
   * @param sourceDir Source directory
   * @param destDir Destination directory (project root directory)
   * @return void
   */
  copyServices(serviceNameList: Array<string>, sourceDir: string, destDir: string) :Promise<void[]> {
    const copyResult = []
    fs.mkdirp(path.join(destDir, 'services'))
    for (const serviceName of serviceNameList) {
      copyResult.push(fs.copy(path.join(sourceDir, serviceName), path.join(destDir, 'services', serviceName), {}))
    }

    return Promise.all(copyResult)
  }
}
