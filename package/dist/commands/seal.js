"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("node:fs");
const path = require("node:path");
const crypt = require("../pkg/seal/crypt");
const core_1 = require("@oclif/core");
const generate_1 = require("../pkg/seal/generate");
const yaml_1 = require("../pkg/common/yaml");
class Seal extends core_1.Command {
    async run() {
        const { flags } = await this.parse(Seal);
        if (flags.gen) {
            this.log('Generate flag presented ', flags.gen);
            await (0, generate_1.generateKeyPair)(flags.gen, flags['pk-base64']);
            this.log('KeyPair files generated');
        }
        let key = null;
        try {
            key = crypt.gePublictKey(flags.cert);
        }
        catch (error) {
            this.error(error.message);
        }
        if (!key) {
            this.error('Public key is required');
        }
        let secretObj = {};
        if (flags.literal && flags.literal.length > 0) {
            for (const item of flags.literal) {
                const keyValue = [
                    item.slice(0, Math.max(0, item.indexOf('='))),
                    item.slice(item.indexOf('=') + 1),
                ];
                secretObj = {
                    ...secretObj,
                    [keyValue[0]]: crypt.encrypt(keyValue[1], key),
                };
            }
        }
        if (flags['from-file'] && flags['from-file'].length > 0) {
            for (const item of flags['from-file']) {
                const fileName = path.basename(item);
                secretObj = {
                    ...secretObj,
                    [fileName]: crypt.encrypt(fs.readFileSync(path.resolve(item), 'utf8'), key),
                };
            }
        }
        if (Object.keys(secretObj).length === 0) {
            return;
        }
        (0, yaml_1.createYaml)({
            secret: secretObj,
        }, flags['output-file'] || 'secrets.yml');
    }
}
exports.default = Seal;
Seal.description = 'add a server-less target';
Seal.examples = [
    `  telar seal --literal db-pass=p@55w0rd
  telar seal --from-file api-key.txt
  telar seal --literal a=b --literal c=d --cert public.key --output-file secrets.yml
  telar seal --gen secret --pk-base64`,
];
Seal.flags = {
    // Help
    help: core_1.Flags.help({ char: 'h' }),
    // Generate key pair
    gen: core_1.Flags.string({ char: 'g', description: 'Generate key pair' }),
    // Whether generate base64 version of private key or not
    'pk-base64': core_1.Flags.boolean({
        default: false,
        description: 'Whether generate base64 version of private key or not',
    }),
    // Output secret file name
    'output-file': core_1.Flags.string({
        char: 'o',
        default: 'secrets.yml',
        description: 'Output file for secrets',
    }),
    // Public key
    cert: core_1.Flags.string({
        char: 'c',
        default: 'secret-public.key',
        description: 'The path to the public key file. Default is secret-public.key',
    }),
    // Literal
    literal: core_1.Flags.string({
        char: 'l',
        multiple: true,
        description: 'Secret literal key-value data',
    }),
    // From file
    'from-file': core_1.Flags.string({
        char: 'i',
        multiple: true,
        description: 'Secret literal key-value data',
    }),
};
Seal.args = [{ name: 'file' }];
