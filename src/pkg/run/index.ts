import * as shell from 'shelljs'
import * as fs from 'fs-extra'
import * as path from 'node:path'
import * as readLine from 'node:readline'
import * as os from 'node:os'
import {MicroRun} from '../common/types'
// import chalk from 'chalk'
const handlerFileName = 'handler.js'

const {start: fastifyStart} = require('fastify-cli/start')
export const run = async (dirList: Array<string>, port: number): Promise<void> => {
  const currentDirectory = shell.pwd().stdout
  require('dotenv').config()
  const microsPromises: Array<Promise<Array<MicroRun>>> = []
  let micros: Array<MicroRun> = []
  for (const dir of dirList.map((dir:string) => path.resolve(dir))) {
    microsPromises.push(extractMicros(dir))
  }

  for (const extractedMicro of (await Promise.all(microsPromises))) {
    micros = [...micros, ...extractedMicro]
  }

  // Set routes for micro-services
  let microRouters = '// [micro-routers] \n'
  for (const micro of micros) {
    microRouters += `
    router.all('${micro.path}/*', (req, res) => {
      require('${path.join(micro.dir, handlerFileName)}')(req, res)
    })
    router.all('${micro.path}', (req, res) => {
       require('${path.join(micro.dir, handlerFileName)}')(req, res)
     })\n
      `
  }

  // Copy server files
  const jsfile = await fs.readFile(path.resolve(__dirname, path.join('server', 'index.js')), 'utf8')
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'telar-run-'))
  console.log('tempdir', tmpDir)
  await fs.writeFile(path.join(tmpDir, 'index.js'), jsfile.replace('// [micro-routers]', microRouters))

  // Must run fastify in current directory to watch the changes
  shell.cd(currentDirectory)
  const fastifyArgs = ['-p', port, '-w', '-d', '-d', '-P', '-l', 'debug']

  for (const dir of dirList) {
    fastifyArgs.push('--watch-dir', dir)
  }

  fastifyArgs.push(path.join(tmpDir, 'index.js'))
  await fastifyStart(fastifyArgs)
}

/**
 * Extract telar api configuradtion
 * @param path handler path
 * @returns {{path: string}} { route }
 */
const extractTelarApiConfig = async (path: string) => {
  const  pathExist = await fs.pathExists(path)
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
        case 'path':
          config = {...config, path: ruleValue}
          break

        default:
          break
        }
      }

      break
    }
  }

  return config
}

const extractMicros = async (dir: string): Promise<Array<MicroRun>> => {
  const microsLs = shell.ls(dir)
  if (microsLs.code !== 0) {
    throw new Error(`Directory "${dir}" does not exist `)
  }

  const micros = microsLs.map(micro => ({dir: path.join(dir, micro), name: micro, path: `/${micro}`}))
  const microsConfig = await Promise.all(micros.map(micro => extractTelarApiConfig(path.join(micro.dir, handlerFileName))))
  for (const [index, config] of microsConfig.entries()) {
    micros[index] = {...micros[index], ...config}
  }

  return micros
}
