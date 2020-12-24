import * as fs from 'fs'
import * as path from 'path'
import * as crypt from '../pkg/seal/crypt'
import {Command, flags} from '@oclif/command'
import {generateKeyPair} from '../pkg/seal/generate'
import {createYaml} from '../pkg/common/yaml'

export default class Seal extends Command {
  static description = 'add a server-less target'

  static examples = [
    `  telar seal --literal db-pass=p@55w0rd
  telar seal --from-file api-key.txt
  telar seal --literal a=b --literal c=d --cert public.key --output-file secrets.yml
  telar seal --gen`,
  ]

  static flags = {
    // Help
    help: flags.help({char: 'h'}),
    // Generate key pair
    gen: flags.boolean({char: 'g', description: 'Generate key pair'}),
    // Output secret file name
    'output-file': flags.string({char: 'o', env: 'secrets.yml', description: 'Output file for secrets'}),
    // Public key
    cert: flags.string({char: 'c', env: 'public.key', description: 'The path to the public key file. Default is public.key'}),
    // Literal
    literal: flags.string({char: 'l', multiple: true, description: 'Secret literal key-value data'}),
    // From file
    'from-file': flags.string({char: 'i', multiple: true, description: 'Secret literal key-value data'}),
  }

  static args = [{name: 'file'}]

  async run() {
    const {flags} = this.parse(Seal)

    if (flags.gen) {
      await generateKeyPair()
      this.log('KeyPair files generated')
    }

    let key: string|null = null
    try {
      key = crypt.gePublictKey(flags.cert)
    } catch (error) {
      this.error(error.message)
    }
    if (!key) {
      this.error('Public key is required')
    }
    let secretObj = {}
    if (flags.literal && flags.literal.length > 0) {
      flags.literal.forEach(item => {
        const keyValue = item.split('=')
        secretObj = {...secretObj, [keyValue[0]]: crypt.encrypt(keyValue[1], key!)}
      })
    }

    if (flags['from-file'] && flags['from-file'].length > 0) {
      flags['from-file'].forEach(item => {
        const fileName = path.basename(item)
        secretObj = {...secretObj, [fileName]: crypt.encrypt(fs.readFileSync(path.resolve(item), 'utf8'), key!)}
      })
    }

    createYaml({
      secret: secretObj,
    }, flags['output-file'] || 'secrets.yml')
  }
}
