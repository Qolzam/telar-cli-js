"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const html_1 = require("../pkg/html");
class HTML extends core_1.Command {
    async run() {
        const { args } = await this.parse(HTML);
        if (args.arg0) {
            switch (args.arg0) {
                case 'compile':
                    (0, html_1.compileTemplate)(args.path);
                    break;
                default:
                    this.error(`Argument ${args.arg0} is not valid. Check help "$ telar html -h" `);
                    break;
            }
        }
        else {
            this.error('Argument is required! e.g. `$ telar html compile ./auth`');
        }
    }
}
exports.default = HTML;
HTML.description = 'compile html template file to a Javascript compile function';
HTML.examples = ['$ telar html compile ./auth'];
HTML.flags = {
    // Help
    help: core_1.Flags.help({ char: 'h' }),
};
HTML.args = [{ name: 'arg0' }, { name: 'path' }];
