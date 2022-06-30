import {Command, Flags} from '@oclif/core'
import {sync} from '../pkg/sync'

export default class Sync extends Command {
  static description = 'sync @telar/core project with target platform';

  static examples = ['$ telar sync vercel'];

  static flags = {
    // Help
    help: Flags.help({char: 'h'}),
    // Stack file path
    file: Flags.string({
      char: 'f',
      default: 'stack.yml',
      description: 'Stack file path',
    }),
  };

  static args = [{name: 'target'}];

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
