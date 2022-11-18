"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const sync_1 = require("../pkg/sync");
class Sync extends core_1.Command {
    async run() {
        const { args, flags } = await this.parse(Sync);
        if (args.target) {
            this.log(`Platform target is ${args.target}`);
            try {
                await (0, sync_1.sync)(args.target, flags.file);
            }
            catch (error) {
                this.error(error.message);
            }
        }
    }
}
exports.default = Sync;
Sync.description = 'sync @telar/core project with target platform';
Sync.examples = ['$ telar sync vercel'];
Sync.flags = {
    // Help
    help: core_1.Flags.help({ char: 'h' }),
    // Stack file path
    file: core_1.Flags.string({
        char: 'f',
        default: 'stack.yml',
        description: 'Stack file path',
    }),
};
Sync.args = [{ name: 'target' }];
