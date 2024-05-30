import {Args, Command, Flags} from '@oclif/core'

import {compileTemplate} from '../pkg/html/index.js'

export default class HTML extends Command {
  static args = {
    arg0: Args.string({
      name: 'arg0',
    }),
    path: Args.string({
      name: 'path',
    }),
  }

  static description
    = 'compile html template file to a Javascript compile function'

  static examples = ['$ telar html compile ./auth']

  static flags = {
    // Help
    help: Flags.help({char: 'h'}),
  }

  async run() {
    const {args} = await this.parse(HTML)

    if (args.arg0) {
      switch (args.arg0) {
      case 'compile': {
        if (!args.path) {
          this.error('Argument `path` is undefined.')
        }

        compileTemplate(args.path)
        break
      }

      default: {
        this.error(
          `Argument ${args.arg0} is not valid. Check help "$ telar html -h" `,
        )
        break
      }
      }
    } else {
      this.error('Argument is required! e.g. `$ telar html compile ./auth`')
    }
  }
}
