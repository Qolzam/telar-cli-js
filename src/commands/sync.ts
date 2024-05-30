import {Args, Command, Flags} from '@oclif/core'

import {sync} from '../pkg/sync/index.js'

export default class Sync extends Command {
  static args = {
    target: Args.string({name: 'target'}),
  }

  static description = 'sync @telar/core project with target platform'

  static examples = ['$ telar sync vercel']

  static flags = {
    // Stack file path
    file: Flags.string({
      char: 'f',
      default: 'stack.yml',
      description: 'Stack file path',
    }),
    // Help
    help: Flags.help({char: 'h'}),
  }

  async run() {
    const {args, flags} = await this.parse(Sync)

    if (args.target) {
      this.log(`Platform target is ${args.target}`)
      try {
        await sync(args.target, flags.file!)
      } catch (error: any) {
        this.error(error.message)
      }
    }
  }
}
