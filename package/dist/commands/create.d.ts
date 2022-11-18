/// <reference types="node" />
import { Command } from '@oclif/core';
import { ChildProcess } from 'node:child_process';
import { ServiceMeta, ServiceStatus } from '../pkg/common/types';
export default class Create extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        help: import("@oclif/core/lib/interfaces").BooleanFlag<void>;
        template: import("@oclif/core/lib/interfaces").OptionFlag<string | undefined>;
        config: import("@oclif/core/lib/interfaces").OptionFlag<string>;
        output: import("@oclif/core/lib/interfaces").OptionFlag<string>;
    };
    static args: {
        name: string;
        required: boolean;
        description: string;
    }[];
    solutionStatus: string;
    servicesStatus: {
        [key: string]: ServiceStatus;
    };
    servicesMeta: {
        [key: string]: ServiceMeta;
    };
    solutionRun: ChildProcess | null;
    run(): Promise<void>;
    startSolution(inputTemplateName: string | null, inputTargetRepo: string | null): Promise<void>;
    gitClone(targetRepo: string, dir: string): Promise<void>;
    /**
     * Copy services to project directory
     * @param serviceNameList List of services name
     * @param sourceDir Source directory
     * @param destDir Destination directory (project root directory)
     * @return void
     */
    copyServices(serviceNameList: Array<string>, sourceDir: string, destDir: string): Promise<void[]>;
}
