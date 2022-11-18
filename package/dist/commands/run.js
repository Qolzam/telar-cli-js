"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const run_1 = require("../pkg/run");
class Sync extends core_1.Command {
    async run() {
        const { flags } = await this.parse(Sync);
        this.log(`Prepare server to run micro-services in ${flags.dir}`);
        try {
            await (0, run_1.run)(flags.dir, flags.port);
        }
        catch (error) {
            this.error(error.message);
        }
    }
}
exports.default = Sync;
Sync.description = 'run a server for Telar micro-services';
Sync.examples = ['$ telar run'];
Sync.flags = {
    // Help
    help: core_1.Flags.help({ char: 'h' }),
    // Micro-services directory
    dir: core_1.Flags.string({
        char: 'd',
        default: 'micros',
        description: 'The directory for micro-services',
    }),
    port: core_1.Flags.integer({
        char: 'p',
        default: 3000,
        description: 'The port that server listen to',
    }),
};
