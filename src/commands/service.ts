import {Args, Command, Flags} from '@oclif/core'
import  {readFile} from 'node:fs/promises'
import path from 'node:path'

import {ServiceProcess} from '../pkg/service/service.process.js'

export default class Service extends Command {
  static args = {
    call: Args.string({
      default: 'run',
      name: 'call',
    }),
    path: Args.string({
      default: '.',
      name: 'path',
    }),
  }

  static description = 'run a service'
  static examples = ['$ telar service run .']
  static flags = {
    config: Flags.string({}),
    // Help
    help: Flags.help({char: 'h'}),
  }

  async run() {
    const {args, flags} = await this.parse(Service)
    try {
      let configFile = {}

      if (flags.config) {
        const configPath = path.join(path.resolve(args.path), flags.config)
        // read config file from json file
        const configFileContent = await readFile(configPath, 'utf8')
        configFile = JSON.parse(configFileContent)
      } else {
        this.log('There is no config file set `--config="./config.json"')
      }

      if (args.call === 'run') {
        ServiceProcess.runService(args.path, args.path, configFile)
      } else if (args.call === 'install') {
        ServiceProcess.setupService(args.path, args.path, configFile)
      } else {
        this.error('invalid call for service')
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.error(error.message)
      }
    }
  }
}
