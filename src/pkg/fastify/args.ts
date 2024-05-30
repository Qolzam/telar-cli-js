/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config.js'
import argv from 'yargs-parser'

import {requireModule} from './util.js'

const DEFAULT_IGNORE = 'node_modules build dist .git bower_components logs .swp .nyc_output'

const DEFAULT_ARGUMENTS = {
  closeGraceDelay: 500,
  commonPrefix: false,
  debug: false,
  debugPort: 9320,
  lang: 'js',
  logLevel: 'fatal',
  options: false,
  pluginTimeout: 10 * 1000, // everything should load in 10 seconds
  prettyLogs: false,
  standardlint: false,
  verboseWatch: false,
  watch: false,
}

interface ParsedArgs {
  _: any[]
  '--': string[]
  address?: string
  bodyLimit?: number
  closeGraceDelay?: number
  commonPrefix?: boolean
  debug?: boolean
  debugHost?: string
  debugPort?: number
  ignoreWatch: string
  import?: string
  includeHooks?: boolean
  lang?: string
  logLevel?: string
  loggingModule?: string
  method?: string
  options?: boolean
  pluginOptions: Record<string, any>
  pluginTimeout?: number
  port?: number
  prefix?: string
  prettyLogs?: boolean
  require?: string
  socket?: string
  verboseWatch?: boolean
  watch?: boolean
  watchDir: string[]
}

export async function parseArgs(args: string[]): Promise<ParsedArgs> {
  const commandLineArguments = argv(args, {
    alias: {
      address: ['a'],
      'close-grace-delay': ['g'],
      config: ['c'],
      debug: ['d'],
      'debug-port': ['I'],
      help: ['h'],
      import: ['i'],
      'log-level': ['l'],
      'logging-module': ['L'],
      options: ['o'],
      'plugin-timeout': ['T'],
      port: ['p'],
      prefix: ['x'],
      'pretty-logs': ['P'],
      require: ['r'],
      socket: ['s'],
      'verbose-watch': ['V'],
      watch: ['w'],
    },
    boolean: [
      'pretty-logs',
      'options',
      'watch',
      'verbose-watch',
      'debug',
      'standardlint',
      'common-prefix',
      'include-hooks',
    ],
    configuration: {
      'populate--': true,
    },
    envPrefix: 'FASTIFY_',
    number: ['port', 'inspect-port', 'body-limit', 'plugin-timeout', 'close-grace-delay'],
    string: [
      'log-level',
      'address',
      'socket',
      'prefix',
      'ignore-watch',
      'logging-module',
      'debug-host',
      'lang',
      'require',
      'import',
      'config',
      'method',
    ],
  })

  const configFileOptions = commandLineArguments.config ? await requireModule(commandLineArguments.config) : undefined

  const additionalArgs: any = commandLineArguments['--'] || []
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {_, ...pluginOptions} = argv(additionalArgs)
  const ignoreWatchArg = commandLineArguments.ignoreWatch || configFileOptions?.ignoreWatch || ''

  let ignoreWatch = `${DEFAULT_IGNORE} ${ignoreWatchArg}`.trim()
  if (ignoreWatchArg.includes('.ts$')) {
    ignoreWatch = ignoreWatch.replace('dist', '')
  }

  // Merge objects from lower to higher priority
  const parsedArgs = {...DEFAULT_ARGUMENTS, ...configFileOptions, ...commandLineArguments}

  return {
    _: parsedArgs._,
    '--': additionalArgs,
    address: parsedArgs.address,
    bodyLimit: parsedArgs.bodyLimit,
    closeGraceDelay: parsedArgs.closeGraceDelay,
    commonPrefix: parsedArgs.commonPrefix,
    debug: parsedArgs.debug,
    debugHost: parsedArgs.debugHost,
    debugPort: parsedArgs.debugPort,
    ignoreWatch,
    import: parsedArgs.import,
    includeHooks: parsedArgs.includeHooks,
    lang: parsedArgs.lang,
    logLevel: parsedArgs.logLevel,
    loggingModule: parsedArgs.loggingModule,
    method: parsedArgs.method,
    options: parsedArgs.options,
    pluginOptions,
    pluginTimeout: parsedArgs.pluginTimeout,
    port: parsedArgs.port,
    prefix: parsedArgs.prefix,
    prettyLogs: parsedArgs.prettyLogs,
    require: parsedArgs.require,
    socket: parsedArgs.socket,
    verboseWatch: parsedArgs.verboseWatch,
    watch: parsedArgs.watch,
    watchDir: parsedArgs.watchDir,
  }
}
