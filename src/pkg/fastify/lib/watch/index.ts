/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from 'chalk'
import {FSWatcher, watch as chockWatch} from 'chokidar'
import 'dotenv/config'
import * as cp from 'node:child_process'
import {EventEmitter} from 'node:events'
import * as path from 'node:path'
import url from 'node:url'

import {parseArgs} from '../../args.js'
import {Constants} from './constants.js'
import {arrayToRegExp, logWatchVerbose} from './utils.js'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const forkPath = path.join(__dirname, './fork.js')

interface ChildEvent {
  childEvent: string
}

interface EventMessage {
  err?: Error
  type: string
}

const watch = async function (args: string[], ignoreWatch: string, verboseWatch: boolean) {
  // eslint-disable-next-line unicorn/prefer-event-target
  const emitter = new EventEmitter()
  let allStop = false
  let childs: cp.ChildProcess[] = []

  const stop = (watcher: FSWatcher | null = null, err: Error | null = null) => {
    for (const child of childs) {
      child.kill()
    }

    childs = []
    if (err) {
      console.log(chalk.red(err.message))
    }

    if (watcher) {
      allStop = true
      return watcher.close()
    }
  }

  process.on('uncaughtException', () => {
    stop()
    childs.push(run('restart'))
  })

  let readyEmitted = false

  const run = (event: string) => {
    const childEvent: ChildEvent = {childEvent: event}
    const env = {...process.env, ...childEvent}
    const _child = cp.fork(forkPath, args, {
      cwd: process.cwd(),
      encoding: 'utf8',
      env,
    } as any)

    _child.on('exit', () => {
      if (childs.length === 0 && !allStop) {
        childs.push(run('restart'))
      }

      return null
    })

    _child.on('message', (event: EventMessage) => {
      const {err, type} = event
      if (err) {
        emitter.emit('error', err)
        return null
      }

      if (type === 'ready') {
        if (readyEmitted) {
          return
        }

        readyEmitted = true
      }

      emitter.emit(type, err)
    })

    return _child
  }

  childs.push(run('start'))
  const ignoredArr = ignoreWatch
    .split(' ')
    .map((item) => item.trim())
    .filter((item) => item.length)
  const ignoredPattern = arrayToRegExp(ignoredArr)

  const watcher = chockWatch(process.cwd(), {ignored: ignoredPattern})
  const opts = await parseArgs(args)
  if (Array.isArray(opts.watchDir)) {
    for (let index = 0; index < opts.watchDir.length; index++) {
      if (index !== 0) {
        const dir = opts.watchDir[index]
        watcher.add(dir)
      }
    }
  }

  watcher.on('ready', () => {
    watcher.on('all', (event, filepath) => {
      if (verboseWatch) {
        logWatchVerbose(event, filepath)
      }

      try {
        const child = childs.shift()
        if (child) {
          child.send(Constants.GRACEFUL_SHUT)
        }
      } catch (error) {
        if (childs.length > 0) {
          console.log(chalk.red(error instanceof Error ? error.message : String(error)))
          stop(watcher, error instanceof Error ? error : new Error(String(error)))
        }

        childs.push(run('restart'))
      }
    })
  })

  emitter.on('error', (err) => {
    stop(watcher, err)
  })

  emitter.on('close', () => {
    stop(watcher)
  })
  ;(emitter as any).stop = stop.bind(null, watcher)

  return emitter
}

export default watch
