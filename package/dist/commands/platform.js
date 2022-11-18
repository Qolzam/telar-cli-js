"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const shell = require("shelljs");
const fs = require("fs-extra");
const path = require("node:path");
const os = require("node:os");
const defaultTemplateRepository = 'https://github.com/Qolzam/platforms.git';
class Platform extends core_1.Command {
    async run() {
        const { args } = await this.parse(Platform);
        if (!shell.which('git')) {
            this.error('Sorry, git command does not exist! Please install git and run this command again.');
        }
        let targetRepo = defaultTemplateRepository;
        if (args.arg1 === 'pull') {
            targetRepo = args.arg2;
        }
        this.log('Fetch platforms from repository: ', targetRepo);
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'telar-platforms-'));
        const cloneCommand = `git clone --quiet ${defaultTemplateRepository} ${tmpDir}`;
        if (shell.exec(cloneCommand).code !== 0) {
            this.error('Error: Git commit failed');
        }
        const platformPath = path.join(tmpDir, 'platform');
        const platformPathExist = await fs.pathExists(platformPath);
        if (!platformPathExist) {
            this.error('Can not find platform directory in fetched repository!');
        }
        const currentDirectory = shell.pwd().stdout;
        const targetPath = path.join(currentDirectory, 'platform');
        shell.cp('-R', platformPath, targetPath);
        const platformDirs = shell.ls(targetPath);
        this.log(`Fetched ${platformDirs.length} platforms(s) : [ ${platformDirs.join(', ')} ]`);
    }
}
exports.default = Platform;
Platform.description = 'Fetch platforms which using @telar/core project';
Platform.examples = [
    '$ telar platform',
    '$ telar platform pull https://github.com/Qolzam/platforms.git',
];
Platform.flags = {
    // Help
    help: core_1.Flags.help({ char: 'h' }),
};
Platform.args = [{ name: 'arg1' }, { name: 'arg2' }];
