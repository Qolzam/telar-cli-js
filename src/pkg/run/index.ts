import * as shell from 'shelljs'
import * as fs from 'fs-extra'
import * as path from 'node:path'
import * as readLine from 'node:readline'
import * as os from 'node:os'
// import chalk from 'chalk'

const {start: fastifyStart} = require('fastify-cli/start')
export const run = async (dir: string, port: number) => {
  const currentDirectory = shell.pwd().stdout
  require('dotenv').config({path: `${currentDirectory}/config/env/.env`})
  console.log(process.env.test)
  const handlerFileName = 'handler.js'
  const microsLs = shell.ls(dir)
  if (microsLs.code !== 0) {
    throw new Error(`Directory "${dir}" does not exist `)
  }

  const micros = microsLs.map(micro => ({dir: path.join(currentDirectory, dir, micro), name: micro, path: `/${micro}`}))
  const microsConfig = await Promise.all(micros.map(micro => getTelarApiConfig(path.join(micro.dir, handlerFileName))))
  for (const [index, config] of microsConfig.entries()) {
    micros[index] = {...micros[index], ...config}
  }

  // Set routes for micro-services
  let microRouters = '// [micro-routers] \n'
  for (const micro of micros) {
    microRouters += `
    router.all('${micro.path}', (req, res) => {
       require('${path.join(micro.dir, handlerFileName)}')(req, res)
     })\n
      `
  }

  // Copy server files
  const jsfile = await fs.readFile(path.resolve(__dirname, path.join('server', 'index.js')), 'utf8')
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'telar-run-'))
  await fs.writeFile(path.join(tmpDir, 'index.js'), jsfile.replace('// [micro-routers]', microRouters))
  const packageJsonFile = await fs.readFile(path.resolve(__dirname, path.join('server', 'package.json')), 'utf8')
  await fs.writeFile(path.join(tmpDir, 'package.json'), packageJsonFile)

  // Install server node modules
  shell.cd(tmpDir)
  shell.exec('npm i', {silent: true}, async () => {
    // Must run fastify in current directory to watch the changes
    shell.cd(currentDirectory)
    await fastifyStart(['-p', port, '-w', '-d', path.join(tmpDir, 'index.js')])
    console.log(`Server is running on port ${port}`)
  })
}

/**
 * Get telar api configuration
 * @param path handler path
 * @returns {{path: string}} { route }
 */
const getTelarApiConfig = async (path: string) => {
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
