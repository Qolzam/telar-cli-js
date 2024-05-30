/* eslint-disable @typescript-eslint/no-explicit-any */
import closeWithGrace from 'close-with-grace'
import 'dotenv/config'
import isDocker from 'is-docker'

import {deepmerge} from '../deepmerge.js'
import {parseArgs} from './args.js'
import watch from './lib/watch/index.js'
import {
  exit,
  isKubernetes,
  requireESModule,
  requireFastifyForModule,
  requireModule,
  requireServerPluginFromPath,
  showHelpForCommand,
} from './util.js'

const listenAddressDocker = '0.0.0.0'

let Fastify: any = null

async function loadModules(opts: any) {
  try {
    const {module: fastifyModule} = (await requireFastifyForModule(opts._[0])) as any
    Fastify = fastifyModule.default
  } catch (error) {
    stop(error)
  }
}

async function start(args: string[]) {
  const opts: any = await parseArgs(args)
  if (opts.help) {
    return showHelpForCommand('start')
  }

  if (opts._.length !== 1) {
    console.error('Missing the required file parameter\n')
    return showHelpForCommand('start')
  }

  await loadModules(opts)

  if (opts.watch) {
    return watch(args, opts.ignoreWatch, opts.verboseWatch)
  }

  return runFastify(args)
}

function stop(message: unknown) {
  exit(message as string)
}

function preloadCJSModules(opts: any) {
  if (typeof opts.require === 'string') {
    opts.require = [opts.require]
  }

  try {
    // eslint-disable-next-line unicorn/no-array-for-each
    opts.require.forEach((module: string) => {
      if (module) {
        requireModule(module)
      }
    })
  } catch (error) {
    stop(error as string)
  }
}

async function preloadESModules(opts: any) {
  if (typeof opts.import === 'string') {
    opts.import = [opts.import]
  }

  for (const m of opts.import) {
    if (m) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await requireESModule(m)
      } catch (error) {
        stop(error as unknown)
      }
    }
  }
}

// eslint-disable-next-line complexity
async function runFastify(args: string[], additionalOptions?: any, serverOptions?: any) {
  const opts: any = await parseArgs(args)

  if (opts.require) {
    preloadCJSModules(opts)
  }

  if (opts.import) {
    await preloadESModules(opts)
  }

  opts.port = opts.port || process.env.PORT || 3000

  await loadModules(opts)

  let file: any = null

  try {
    file = await requireServerPluginFromPath(opts._[0])
  } catch (error) {
    return stop(error)
  }

  let logger: any
  if (opts.loggingModule) {
    try {
      logger = requireModule(opts.loggingModule)
    } catch (error) {
      stop(error)
    }
  }

  const defaultLogger = {
    level: opts.logLevel,
  }
  let options: any = {
    logger: logger || defaultLogger,
    pluginTimeout: opts.pluginTimeout,
  }

  if (opts.bodyLimit) {
    options.bodyLimit = opts.bodyLimit
  }

  if (opts.prettyLogs) {
    options.logger.transport = {
      target: 'pino-pretty',
    }
  }

  if (opts.debug) {
    if (/v[0-6]\..*/g.test(process.version)) {
      stop('Fastify debug mode not compatible with Node.js version < 6')
    } else {
      ;(await import('node:inspector')).open(
        opts.debugPort,
        opts.debugHost || (isDocker() || (await isKubernetes()) ? listenAddressDocker : undefined),
      )
    }
  }

  if (serverOptions) {
    options = deepmerge()(options, serverOptions)
  }

  if (opts.options && file.options) {
    options = deepmerge()(options, file.options)
  }

  // eslint-disable-next-line new-cap
  const fastify = Fastify(options)

  if (opts.prefix) {
    opts.pluginOptions.prefix = opts.prefix
  }

  const appConfig = {...opts.pluginOptions, ...additionalOptions}
  await fastify.register(file.default || file, appConfig)

  const closeListeners = closeWithGrace({delay: opts.closeGraceDelay}, async ({err}) => {
    if (err) {
      fastify.log.error(err)
    }

    await fastify.close()
  })

  await fastify.addHook('onClose', (instance: any, done: any) => {
    closeListeners.uninstall()
    done()
  })

  if (additionalOptions && additionalOptions.ready) {
    await fastify.ready()
  } else if (opts.address) {
    await fastify.listen({host: opts.address, port: opts.port})
  } else if (opts.socket) {
    await fastify.listen({path: opts.socket})
  } else if (isDocker() || (await isKubernetes())) {
    await fastify.listen({host: listenAddressDocker, port: opts.port})
  } else {
    await fastify.listen({port: opts.port})
  }

  return fastify
}

function cli(args: string[]) {
  start(args)
}

export {cli, runFastify, start, stop}
