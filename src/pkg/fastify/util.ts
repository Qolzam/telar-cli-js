/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable n/no-process-exit */
import {pathExists} from 'fs-extra'
/* eslint-disable unicorn/no-process-exit */
import fs from 'node:fs'
import path from 'node:path'
import url, {fileURLToPath} from 'node:url'
import {packageUp} from 'package-up'
import resolveFrom from 'resolve-from'
import * as semver from 'semver'

const moduleSupport: boolean = semver.satisfies(process.version, '>= 14 || >= 12.17.0 < 13.0.0')

function exit(message?: Error | string): never {
  if (message instanceof Error) {
    console.log(message)
  } else if (message) {
    console.log(`Warn: ${message}`)
  }

  process.exit(1)
}

async function importModule(moduleName: string): Promise<any> {
  if (await pathExists(moduleName)) {
    const moduleFilePath = path.resolve(moduleName)
    return import(url.pathToFileURL(moduleFilePath).toString())
  }

  return import(moduleName)
}

async function requireESModule(moduleName: string): Promise<any> {
  return importModule(moduleName)
}

async function requireFastifyForModule(modulePath: string): Promise<{module: any} | undefined> {
  try {
    const basedir = path.resolve(process.cwd(), modulePath)
    const modulePathOrName = resolveFrom.silent(basedir, 'fastify') || 'fastify'
    const module = await importModule(modulePathOrName)

    return {module}
  } catch {
    exit('unable to load fastify module')
  }
}

function isInvalidAsyncPlugin(plugin: any): boolean {
  return plugin && plugin.length !== 2 && plugin.constructor.name === 'AsyncFunction'
}

async function getPackageType(cwd: string): Promise<string | undefined> {
  const nearestPackage = await packageUp({cwd})
  if (nearestPackage) {
    const packageJson = await import(url.pathToFileURL(nearestPackage).toString())
    return packageJson.type
  }
}

function getScriptType(fname: string, packageType?: string): string {
  const modulePattern = /\.mjs$/i
  const commonjsPattern = /\.cjs$/i
  return (modulePattern.test(fname) ? 'module' : commonjsPattern.test(fname) ? 'commonjs' : packageType) || 'commonjs'
}

async function requireServerPluginFromPath(modulePath: string): Promise<any> {
  const resolvedModulePath = path.resolve(process.cwd(), modulePath)

  if (!(await pathExists(resolvedModulePath))) {
    throw new Error(`${resolvedModulePath} doesn't exist within ${process.cwd()}`)
  }

  const packageType = await getPackageType(resolvedModulePath)
  const type = getScriptType(resolvedModulePath, packageType)

  let serverPlugin
  if (type === 'module') {
    if (moduleSupport) {
      serverPlugin = await import(url.pathToFileURL(resolvedModulePath).href)
    } else {
      throw new Error(
        `fastify-cli cannot import plugin at '${resolvedModulePath}'. Your version of node does not support ES modules. To fix this error upgrade to Node 14 or use CommonJS syntax.`,
      )
    }
  } else {
    serverPlugin = await import(url.pathToFileURL(resolvedModulePath).toString())
  }

  if (isInvalidAsyncPlugin(serverPlugin.default)) {
    throw new Error(
      'Async/Await plugin function should contain 2 arguments. Refer to documentation for more information.',
    )
  }

  return serverPlugin
}

async function showHelpForCommand(commandName: string): Promise<void> {
  const __dirname = fileURLToPath(import.meta.url)
  const helpFilePath = path.join(__dirname, 'help', `${commandName}.txt`)

  try {
    console.log(fs.readFileSync(helpFilePath, 'utf8'))
    exit()
  } catch {
    exit(`unable to get help for command "${commandName}"`)
  }
}

async function isKubernetes(): Promise<boolean> {
  // Detection based on https://kubernetes.io/docs/reference/kubectl/#in-cluster-authentication-and-namespace-overrides
  const tokenExist = await pathExists('/run/secrets/kubernetes.io/serviceaccount/token')
  return process.env.KUBERNETES_SERVICE_HOST !== undefined || tokenExist
}

export {
  exit,
  importModule as requireModule, // Alias for compatibility
  isKubernetes,
  requireESModule,
  requireFastifyForModule,
  requireServerPluginFromPath,
  showHelpForCommand,
}
