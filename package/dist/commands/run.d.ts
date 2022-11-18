import { Command } from '@oclif/core';
export default class Sync extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        help: import("@oclif/core/lib/interfaces").BooleanFlag<void>;
        dir: import("@oclif/core/lib/interfaces").OptionFlag<string>;
        port: import("@oclif/core/lib/interfaces").OptionFlag<number>;
    };
    run(): Promise<void>;
}
