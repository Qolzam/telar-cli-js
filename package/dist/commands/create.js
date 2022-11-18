"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const shell = require("shelljs");
const fs = require("fs-extra");
const path = require("node:path");
const os = require("node:os");
const got_1 = require("got");
const node_child_process_1 = require("node:child_process");
const constants_1 = require("../pkg/create/constants");
const server_1 = require("../pkg/web-solutions/server");
const actions_1 = require("../pkg/web-solutions/actions");
const helpers_1 = require("../helpers");
const defaultTemplateRepository = 'https://github.com/Qolzam/creates.git';
class Create extends core_1.Command {
    constructor() {
        super(...arguments);
        // properties
        this.solutionStatus = 'inactive';
        this.servicesStatus = {};
        this.servicesMeta = {};
        this.solutionRun = null;
    }
    async run() {
        const { args, flags } = await this.parse(Create);
        let targetRepo = null;
        if (args.arg1 === 'pull') {
            targetRepo = args.arg2;
        }
        let templateName = null;
        if (flags.template) {
            templateName = flags.template;
        }
        // dispatch actions from UI
        const dispatcher = (action) => {
            switch (action.type) {
                case actions_1.SOLUTION_START:
                    this.startSolution(templateName, targetRepo);
                    break;
                default:
                    break;
            }
        };
        const server = (0, server_1.getServer)(dispatcher, () => {
            if (this.solutionStatus === 'inactive') {
                this.startSolution(templateName, targetRepo);
            }
        });
        server.listen(3001);
        await new Promise(() => {
            console.log('-----------------------------------------------');
            console.log('Service is running. Press ctrl+c to exit!');
            console.log('----------------------------------------------- \n\n');
        });
    }
    async startSolution(inputTemplateName, inputTargetRepo) {
        // change solution status
        this.solutionStatus = 'running';
        // Path
        const solutionName = 'ts-ui-encore';
        const projectPath = '/Users/qolzam/projects/telar/solutions';
        const templatesPath = path.join(projectPath, 'templates');
        const solutionSetupJsPath = path.join(templatesPath, solutionName, 'setup.js');
        const solutionRunJsPath = path.join(templatesPath, solutionName, 'run.js');
        const dotTelarDirectoryPath = path.join(projectPath, '.telar');
        const telarManifestPath = path.join(dotTelarDirectoryPath, 'manifest.json');
        // create .telar directory in project root
        await fs.mkdirp(dotTelarDirectoryPath);
        // write .gitignore file
        const gitignoreContent = '.telar\ntemplates';
        await fs.writeFile(path.join(projectPath, '.gitignore'), gitignoreContent);
        // Fork project setup.js/run.js
        const solutionSetup = (0, node_child_process_1.fork)(solutionSetupJsPath);
        this.solutionRun = (0, node_child_process_1.fork)(solutionRunJsPath, { silent: true });
        if (this.solutionRun.stdout) {
            this.solutionRun.stdout.on('data', (data) => {
                (0, helpers_1.logger)('info', '', String(data));
            });
        }
        this.solutionRun.on('error', (err) => {
            (0, helpers_1.logger)('error', solutionName, '\n\t\tERROR: spawn failed! (' + err + ')');
        });
        if (this.solutionRun.stderr) {
            this.solutionRun.stderr.on('data', (data) => {
                (0, helpers_1.logger)('info', '', String(data));
            });
        }
        this.solutionRun.on('exit', (code, signal) => {
            (0, helpers_1.logger)('warn', solutionName, `exit with code ${code} and signal ${signal} `);
        });
        // Setup project
        solutionSetup.send({
            type: 'setup',
            payload: {
                rootPath: projectPath,
                devConfigPath: '/Users/qolzam/Downloads/telar-social/config.development.json',
                prodConfigPath: '/Users/qolzam/Downloads/telar-social/config.production.json',
            },
        });
        // // Run project services before running project
        const telarEnv = process.env.TELAR_ENV;
        const telarManifest = require(telarManifestPath);
        let services = telarManifest.development.services && Object.keys(telarManifest.development.services).length > 0 ? telarManifest.development.services : null;
        if (telarEnv === 'production') {
            services = telarManifest.production.services && Object.keys(telarManifest.production.services).length > 0 ? telarManifest.production.services : null;
        }
        let servicesName = [];
        const onAllServicesActivated = () => {
            (0, helpers_1.logger)('info', 'CLI', 'all services are activated.');
            if (!this.solutionRun) {
                (0, helpers_1.logger)('error', 'CLI', 'solution run child process is null!');
                return;
            }
            this.solutionRun.send({ type: 'run', meta: { rootPath: projectPath } });
        };
        // handle service status
        const onServiceStatus = (name, status) => {
            this.servicesStatus[name] = status;
            if (servicesName.every(serviceName => this.servicesStatus[serviceName] === 'active')) {
                onAllServicesActivated();
            }
            // emit services information to UI
            (0, server_1.uiemit)({
                type: actions_1.SET_SERVICES,
                payload: servicesName.map((serviceName) => {
                    return {
                        name: serviceName,
                        status: this.servicesStatus[serviceName],
                        meta: this.servicesMeta[serviceName],
                    };
                }),
            });
        };
        // services message handler
        const handleServiceMessage = (action, serviceName) => {
            // set service meta on `ready`
            if (action.type === 'ready') {
                this.servicesMeta[serviceName] = action.meta;
            }
            if (action.type === 'ready' || action.type === 'close') {
                onServiceStatus(serviceName, constants_1.onActionServiceStatus[action.type]);
            }
            if (!this.solutionRun) {
                (0, helpers_1.logger)('error', 'CLI', 'solution run child process is null!');
                return;
            }
            this.solutionRun.send({ type: 'service', payload: action.payload, meta: { rootPath: projectPath } });
        };
        const servicesRunFork = {};
        // run services if any
        if (services) {
            servicesName = Object.keys(services);
            // set default status and meta info for services
            for (const name of servicesName) {
                this.servicesStatus = { ...this.servicesStatus, [name]: 'inactive' };
                this.servicesMeta = { ...this.servicesMeta, [name]: [] };
            }
            for (const serviceName of servicesName) {
                const servicePath = path.join(templatesPath, serviceName, 'run.js');
                servicesRunFork[serviceName] = (0, node_child_process_1.fork)(servicePath, { silent: true });
                servicesRunFork[serviceName].stdout.on('data', (data) => {
                    (0, helpers_1.logger)('info', serviceName, String(data));
                });
                servicesRunFork[serviceName].on('error', (err) => {
                    (0, helpers_1.logger)('error', serviceName, '\n\t\tERROR: spawn failed! (' + err + ')');
                });
                servicesRunFork[serviceName].stderr.on('data', (data) => {
                    (0, helpers_1.logger)('info', serviceName, String(data));
                });
                servicesRunFork[serviceName].on('exit', (code, signal) => {
                    (0, helpers_1.logger)('warn', serviceName, `exit with code ${code} and signal ${signal} `);
                });
                servicesRunFork[serviceName].send({ type: 'run', payload: {
                        rootPath: projectPath,
                        config: services[serviceName].config,
                    } });
                servicesRunFork[serviceName].on('message', (message) => handleServiceMessage(message, serviceName));
            }
        }
        process.on('SIGTERM', () => {
            // stop services
            if (services) {
                const servicesName = Object.keys(services);
                for (const serviceName of servicesName) {
                    if (servicesRunFork[serviceName].channel) {
                        servicesRunFork[serviceName].send({ type: 'stop' });
                    }
                }
                console.log(' ON SIGTERM');
                // TODO: Check the services are down the exit
                this.exit(0);
            }
        });
        // Wait for setup to finish
        const stdin = process.openStdin();
        stdin.on('keypress', (chunk, key) => {
            if (key && key.ctrl && key.name === 'c') {
                // stop services
                if (services) {
                    const servicesName = Object.keys(services);
                    for (const serviceName of servicesName) {
                        if (servicesRunFork[serviceName].channel) {
                            servicesRunFork[serviceName].send({ type: 'stop' });
                        }
                    }
                }
                // TODO: Check the services are down the exit
                this.exit(0);
            }
        });
        await new Promise(() => {
            console.log('-----------------------------------------------');
            console.log('Services are running. Press ctrl+c to exit!');
            console.log('----------------------------------------------- \n\n');
        });
        if (!shell.which('git')) {
            this.error('Sorry, git command does not exist! Please install git and run this command again.');
        }
        const storeMicrosResponse = await got_1.default.get('https://raw.githubusercontent.com/telarpress/store/main/solutions.json');
        if (storeMicrosResponse.statusCode !== 200) {
            this.error('Could not retrieve the templates!');
        }
        const storeMicros = JSON.parse(storeMicrosResponse.body);
        // const solutionName = args.solution
        const solution = storeMicros.solutions.find(s => s.name === solutionName);
        if (!solution) {
            this.error(`Could not find the "${solutionName}" solution`);
        }
        let templateName = solution.defaultTemplate;
        if (inputTemplateName) {
            templateName = inputTemplateName;
        }
        if (!solution.templates[templateName]) {
            const allTemplates = Object.keys(solution.templates).join('\n');
            this.error(`Can not find the template "${templateName}". Please check the template name if there is any typo\n` +
                allTemplates);
        }
        let targetRepo = defaultTemplateRepository;
        if (inputTargetRepo) {
            targetRepo = inputTargetRepo;
        }
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'telar-creates-'));
        await this.gitClone(targetRepo, tmpDir);
        const createPath = path.join(tmpDir, 'create');
        const createPathExist = await fs.pathExists(createPath);
        if (!createPathExist) {
            this.error('Can not find create directory in fetched repository!');
        }
        const currentDirectory = shell.pwd().stdout;
        const targetPath = path.join(currentDirectory, 'create');
        shell.cp('-R', createPath, targetPath);
        const createDirs = shell.ls(targetPath);
        this.log(`Fetched ${createDirs.length} creates(s) : [ ${createDirs.join(', ')} ]`);
        // Install solutions
        // Copy services
        // Install services
        // Fork setup.js
        // If [--run] flag , run the services then solutions
        // Fork run.js
    }
    async gitClone(targetRepo, dir) {
        this.log('Fetch creates from repository: ', targetRepo);
        const cloneCommand = `git clone --quiet ${defaultTemplateRepository} ${dir}`;
        if (shell.exec(cloneCommand).code !== 0) {
            this.error('Error: Git clone failed');
        }
    }
    /**
     * Copy services to project directory
     * @param serviceNameList List of services name
     * @param sourceDir Source directory
     * @param destDir Destination directory (project root directory)
     * @return void
     */
    copyServices(serviceNameList, sourceDir, destDir) {
        const copyResult = [];
        fs.mkdirp(path.join(destDir, 'services'));
        for (const serviceName of serviceNameList) {
            copyResult.push(fs.copy(path.join(sourceDir, serviceName), path.join(destDir, 'services', serviceName), {}));
        }
        return Promise.all(copyResult);
    }
}
exports.default = Create;
Create.description = 'Create a project template';
Create.examples = [
    '$ telar create telar-social',
    '$ telar create telar-social --template="telar-social-raw"',
    '$ telar create telar-social --template="telar-social-raw" --output ./path/to/output',
];
Create.flags = {
    // Help
    help: core_1.Flags.help({ char: 'h' }),
    template: core_1.Flags.string({ char: 't', required: false }),
    config: core_1.Flags.string({ char: 'c', default: './conf.yml' }),
    output: core_1.Flags.string({ char: 'o', default: '.' }),
};
Create.args = [
    {
        name: 'solution',
        required: true,
        description: 'Solution name to start a project',
    },
];
