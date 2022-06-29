import {Command, flags} from '@oclif/command'
import {compileTemplate} from '../pkg/html'
import {sync} from '../pkg/sync'

export default class HTML extends Command {
  static description = 'compile html template file to a Javascript compile function'

  static examples = [
    '$ telar html compile ./auth',
  ]

  static flags = {
    // Help
    help: flags.help({char: 'h'}),
  }

  static args = [{name: 'arg0'}, {name: 'path'}]

  async run() {
    const {args} = this.parse(HTML)

    if (args.arg0) {
      switch (args.arg0) {
      case 'compile':
        compileTemplate(args.path)
        break

      default:
        this.error(`Argument ${args.arg0} is not valid. Check help "$ telar html -h" `)
        break
      }
    } else {
      this.error('Argument is required! e.g. `$ telar html compile ./auth`')
    }
  }
}
