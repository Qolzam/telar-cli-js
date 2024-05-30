import {Command, Flags} from '@oclif/core'
import path from 'node:path'

import {run} from '../pkg/run/index.js'

export default class Run extends Command {
  static description = 'run a server for Telar micro-services'

  static examples = ['$ telar run']

  static flags = {
    // Micro-services directory
    dir: Flags.string({
      char: 'd',
      default: [],
      description: 'The directory for micro-services',
      multiple: true,
    }),
    // Help
    help: Flags.help({char: 'h'}),
    port: Flags.integer({
      char: 'p',
      default: 3000,
      description: 'The port that server listen to',
    }),
    server: Flags.string({
      char: 's',
      description: 'External server path',
      required: false,
    }),
  }

  async run() {
    const {flags} = await this.parse(Run)

    this.log(`Prepare server to run micro-services in ${flags.dir}`)
    try {
      const microsPath = [...flags.dir]
      microsPath.unshift(path.join(path.resolve('.'), 'micros'))
      await run(microsPath, flags.port, flags.server)
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.error(error.message)
      } else {
        console.error(error)
      }
    }
  }
}
