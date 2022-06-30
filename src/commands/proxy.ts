import {Command, Flags} from '@oclif/core'
import {proxy} from '../pkg/proxy'

export default class Proxy extends Command {
  static description = 'run a proxy server';

  static examples = ['$ telar proxy -p 80 -t http://social.example.com:4000'];

  static flags = {
    // Help
    help: Flags.help({char: 'h'}),
    // Income port
    port: Flags.string({
      char: 'p',
      default: '80',
      description: 'Income port',
    }),
    target: Flags.string({
      char: 't',
      default: 'http://social.example.com:4000',
      description: 'Proxy server target',
    }),
  };

  async run() {
    const {flags} = await this.parse(Proxy)

    try {
      await proxy(flags.port, flags.target)
    } catch (error: any) {
      this.error(error.message)
    }
  }
}
