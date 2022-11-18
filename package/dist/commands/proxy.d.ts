import { Command } from '@oclif/core';
export default class Proxy extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        help: import("@oclif/core/lib/interfaces").BooleanFlag<void>;
        port: import("@oclif/core/lib/interfaces").OptionFlag<string>;
        target: import("@oclif/core/lib/interfaces").OptionFlag<string>;
    };
    run(): Promise<void>;
}
