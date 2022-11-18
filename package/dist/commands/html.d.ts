import { Command } from '@oclif/core';
export default class HTML extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        help: import("@oclif/core/lib/interfaces").BooleanFlag<void>;
    };
    static args: {
        name: string;
    }[];
    run(): Promise<void>;
}
