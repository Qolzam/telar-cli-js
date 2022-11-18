import { Command } from '@oclif/core';
export default class Seal extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        help: import("@oclif/core/lib/interfaces").BooleanFlag<void>;
        gen: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        'pk-base64': import("@oclif/core/lib/interfaces").BooleanFlag<boolean>;
        'output-file': import("@oclif/core/lib/interfaces").OptionFlag<string>;
        cert: import("@oclif/core/lib/interfaces").OptionFlag<string>;
        literal: import("@oclif/core/lib/interfaces").OptionFlag<string[]>;
        'from-file': import("@oclif/core/lib/interfaces").OptionFlag<string[]>;
    };
    static args: {
        name: string;
    }[];
    run(): Promise<void>;
}
