import {Command, Flags} from '@oclif/core'
import * as shell from 'shelljs'
import * as fs from 'fs-extra'
import * as path from 'node:path'
import * as os from 'node:os'

const defaultTemplateRepository = 'https://github.com/Qolzam/platforms.git'
export default class Platform extends Command {
  static description = 'Fetch platforms which using @telar/core project';

  static examples = [
    '$ telar platform',
    '$ telar platform pull https://github.com/Qolzam/platforms.git',
  ];

  static flags = {
    // Help
    help: Flags.help({char: 'h'}),
  };

  static args = [{name: 'arg1'}, {name: 'arg2'}];

  async run() {
    const {args} = await this.parse(Platform)
    if (!shell.which('git')) {
      this.error(
        'Sorry, git command does not exist! Please install git and run this command again.',
      )
    }

    let targetRepo = defaultTemplateRepository
    if (args.arg1 === 'pull') {
      targetRepo = args.arg2
    }

    this.log('Fetch platforms from repository: ', targetRepo)
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'telar-platforms-'))
    const cloneCommand = `git clone --quiet ${defaultTemplateRepository} ${tmpDir}`
    if (shell.exec(cloneCommand).code !== 0) {
      this.error('Error: Git commit failed')
    }

    const platformPath = path.join(tmpDir, 'platform')
    const platformPathExist = await fs.pathExists(platformPath)
    if (!platformPathExist) {
      this.error('Can not find platform directory in fetched repository!')
    }

    const currentDirectory = shell.pwd().stdout
    const targetPath = path.join(currentDirectory, 'platform')
    shell.cp('-R', platformPath, targetPath)
    const platformDirs = shell.ls(targetPath)
    this.log(
      `Fetched ${platformDirs.length} platforms(s) : [ ${platformDirs.join(
        ', ',
      )} ]`,
    )
  }
}
