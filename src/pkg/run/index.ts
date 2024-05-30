import 'dotenv/config'
import {pathExists} from 'fs-extra'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import readLine from 'node:readline'
import {fileURLToPath} from 'node:url'

import {logRegisteredMicro, logger} from '../../helpers.js'
import {MicroRun} from '../common/types.js'
import {start as startFastifyServer} from '../fastify/start.js'
import shell from '../shell/index.js'

const handlerFileName = 'handler.js'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const run = async (dirList: Array<string>, port: number, externalServerPath?: string): Promise<void> => {
  const currentDirectory = path.resolve('.')
  const serverPath = externalServerPath || (await createServer(dirList))
  // Must run fastify in current directory to watch the changes
  shell.cd(currentDirectory)
  const fastifyArgs = ['-p', String(port), '-w', '-d', '-d', '-P', '-l', 'debug']

  for (const dir of dirList) {
    fastifyArgs.push('--watch-dir', dir)
  }

  logger('info', 'run', 'Running a server for micros is done!')

  // add the server path to the end of arguments
  fastifyArgs.push(serverPath)

  await startFastifyServer(fastifyArgs)
}

/**
 * Extract telar api configuradtion
 * @param path handler path
 * @returns {{path: string}} { route }
 */
const extractTelarApiConfig = async (path: string) => {
  const pathExist = await pathExists(path)
  if (!pathExist) {
    throw new Error(`The API hadnler file ${path} does not exist!`)
  }

  const fileStream = fs.createReadStream(path)
  const rl = readLine.createInterface({
    input: fileStream,
  })
  let config = {}
  for await (const line of rl) {
    if (line.startsWith('// telar:api') || line.startsWith('//telar:api')) {
      for (const rule of line.split(' ')) {
        const ruleKey = rule.split('=')[0]
        const ruleValue = rule.split('=')[1]
        switch (ruleKey) {
          case 'path': {
            config = {...config, path: ruleValue}
            break
          }

          default: {
            break
          }
        }
      }

      break
    }
  }

  return config
}

const createServer = async (dirList: Array<string>) => {
  const microsPromises: Array<Promise<Array<MicroRun>>> = []
  let micros: Array<MicroRun> = []
  for (const dir of dirList.map((dir: string) => path.resolve(dir))) {
    microsPromises.push(extractMicros(dir))
  }

  for (const extractedMicro of await Promise.all(microsPromises)) {
    micros = [...micros, ...extractedMicro]
  }

  logger('info', 'run', 'Extracting all micros is done!')

  // Set routes for micro-services
  let microRouters = '// [micro-routers] \n'
  for (const micro of micros) {
    logRegisteredMicro(micro.path, micro.name)

    // normalize handler file path for the filesystem
    const handlerPath = path.join(micro.dir, handlerFileName).replaceAll('\\', '/')

    // use path.posix.join for URL paths
    const microPath = path.posix.join(micro.path, '/*')

    microRouters += `
    ${
      micro.path === '/'
        ? ''
        : `router.all('${microPath}', (req, res) => {
      require('${handlerPath}')(req, res);
    });`
    }
    router.all('${micro.path}', (req, res) => {
      require('${handlerPath}')(req, res);
    });\n
    `
  }

  logger('info', 'run', 'Building all micros is done! ')

  // Copy server files
  const jsfile = await fs.promises.readFile(path.join(__dirname, path.join('server', 'index.js')), {encoding: 'utf8'})
  const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'telar-run-'))
  await fs.promises.writeFile(path.join(tmpDir, 'index.js'), jsfile.replace('// [micro-routers]', microRouters))
  logger('info', 'run', `Temporary dir created [${tmpDir}]`)
  const serverPath = path.join(tmpDir, 'index.js')
  return serverPath
}

const extractMicros = async (dir: string): Promise<Array<MicroRun>> => {
  const microsLs = await shell.ls(dir, {depth: 1, dirsOnly: true})
  const micros = microsLs.map((micro) => ({
    dir: micro,
    name: micro.split(path.sep).pop()!,
    path: `/${micro.split(path.sep).pop()}`,
  }))

  const microsConfig = await Promise.all(
    micros.map((micro) => extractTelarApiConfig(path.join(micro.dir, handlerFileName))),
  )
  for (const [index, config] of microsConfig.entries()) {
    micros[index] = {...micros[index], ...config}
  }

  return micros
}
