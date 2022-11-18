import { Command } from '@oclif/core';
export default class Sync extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        help: import("@oclif/core/lib/interfaces").BooleanFlag<void>;
        file: import("@oclif/core/lib/interfaces").OptionFlag<string>;
    };
    static args: {
        name: string;
    }[];
    run(): Promise<void>;
}
