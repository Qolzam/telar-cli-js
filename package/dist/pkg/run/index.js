"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const shell = require("shelljs");
const fs = require("fs-extra");
const path = require("node:path");
const readLine = require("node:readline");
const os = require("node:os");
// import chalk from 'chalk'
const { start: fastifyStart } = require('fastify-cli/start');
const run = async (dir, port) => {
    const currentDirectory = shell.pwd().stdout;
    require('dotenv').config();
    const handlerFileName = 'handler.js';
    const microsLs = shell.ls(dir);
    if (microsLs.code !== 0) {
        throw new Error(`Directory "${dir}" does not exist `);
    }
    const micros = microsLs.map(micro => ({ dir: path.join(currentDirectory, dir, micro), name: micro, path: `/${micro}` }));
    const microsConfig = await Promise.all(micros.map(micro => getTelarApiConfig(path.join(micro.dir, handlerFileName))));
    for (const [index, config] of microsConfig.entries()) {
        micros[index] = { ...micros[index], ...config };
    }
    // Set routes for micro-services
    let microRouters = '// [micro-routers] \n';
    for (const micro of micros) {
        microRouters += `
    router.all('${micro.path}/*', (req, res) => {
      require('${path.join(micro.dir, handlerFileName)}')(req, res)
    })
    router.all('${micro.path}', (req, res) => {
       require('${path.join(micro.dir, handlerFileName)}')(req, res)
     })\n
      `;
    }
    // Copy server files
    const jsfile = await fs.readFile(path.resolve(__dirname, path.join('server', 'index.js')), 'utf8');
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'telar-run-'));
    await fs.writeFile(path.join(tmpDir, 'index.js'), jsfile.replace('// [micro-routers]', microRouters));
    // Must run fastify in current directory to watch the changes
    shell.cd(currentDirectory);
    await fastifyStart(['-p', port, '-w', '-d', '-d', '-P', '-l', 'debug', path.join(tmpDir, 'index.js')]);
};
exports.run = run;
/**
 * Get telar api configuration
 * @param path handler path
 * @returns {{path: string}} { route }
 */
const getTelarApiConfig = async (path) => {
    const pathExist = await fs.pathExists(path);
    if (!pathExist) {
        throw new Error(`The API hadnler file ${path} does not exist!`);
    }
    const fileStream = fs.createReadStream(path);
    const rl = readLine.createInterface({
        input: fileStream,
    });
    let config = {};
    for await (const line of rl) {
        if (line.startsWith('// telar:api') || line.startsWith('//telar:api')) {
            for (const rule of line.split(' ')) {
                const ruleKey = rule.split('=')[0];
                const ruleValue = rule.split('=')[1];
                switch (ruleKey) {
                    case 'path':
                        config = { ...config, path: ruleValue };
                        break;
                    default:
                        break;
                }
            }
            break;
        }
    }
    return config;
};
