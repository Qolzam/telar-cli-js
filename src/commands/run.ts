import {Command, Flags} from '@oclif/core'
import {run} from '../pkg/run'

export default class Sync extends Command {
  static description = 'run a server for Telar micro-services';

  static examples = ['$ telar run'];

  static flags = {
    // Help
    help: Flags.help({char: 'h'}),
    // Micro-services directory
    dir: Flags.string({
      char: 'd',
      default: 'micros',
      description: 'The directory for micro-services',
    }),
    port: Flags.integer({
      char: 'p',
      default: 3000,
      description: 'The port that server listen to',
    }),
  };

  async run() {
    const {flags} = await this.parse(Sync)

    this.log(`Prepare server to run micro-services in ${flags.dir}`)
    try {
      await run(flags.dir, flags.port)
    } catch (error: any) {
      this.error(error.message)
    }
  }
}
