import * as shell from 'shelljs'
import * as fs from 'fs-extra'
import * as path from 'node:path'
import * as os from 'node:os'

const {start: fastifyStart} = require('fastify-cli/start')
export const run = async (dir: string, port: number) => {
  const currentDirectory = shell.pwd().stdout

  const micros = shell.ls(dir)

  let microRouters = '// [micro-routers] \n'
  for (const micro of micros) {
    microRouters += `
    router.all('/${micro}', (req, res) => {
       require('${path.join(currentDirectory, dir, micro)}/handler.js')(req, res)
     })\n
      `
  }

  const jsfile = await fs.readFile(path.resolve(__dirname, 'server/index.js'), 'utf8')

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'telar-run-'))
  await fs.writeFile(tmpDir + '/index.js', jsfile.replace('// [micro-routers]', microRouters))
  const packageJsonFile = await fs.readFile(path.resolve(__dirname, 'server/package.json'), 'utf8')
  await fs.writeFile(tmpDir + '/package.json', packageJsonFile)
  shell.cd(tmpDir)
  shell.exec('npm i', {silent: true}, async () => {
    await fastifyStart(['-p', port, '-w', '-d', 'index.js'])
  })
}
