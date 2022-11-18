"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const proxy_1 = require("../pkg/proxy");
class Proxy extends core_1.Command {
    async run() {
        const { flags } = await this.parse(Proxy);
        try {
            await (0, proxy_1.proxy)(flags.port, flags.target);
        }
        catch (error) {
            this.error(error.message);
        }
    }
}
exports.default = Proxy;
Proxy.description = 'run a proxy server';
Proxy.examples = ['$ telar proxy -p 80 -t http://social.example.com:4000'];
Proxy.flags = {
    // Help
    help: core_1.Flags.help({ char: 'h' }),
    // Income port
    port: core_1.Flags.string({
        char: 'p',
        default: '80',
        description: 'Income port',
    }),
    target: core_1.Flags.string({
        char: 't',
        default: 'http://social.example.com:4000',
        description: 'Proxy server target',
    }),
};
