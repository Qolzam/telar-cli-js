import dayjs from 'dayjs'
import inquirer from 'inquirer'
import kleur from 'kleur'
import {createSpinner} from 'nanospinner'
import {ChildProcess} from 'node:child_process'
import {randomUUID} from 'node:crypto'
import path from 'node:path'
import tiged from 'tiged'

import evt from './pkg/common/events.js'
import {Log} from './pkg/common/types.js'
import {ADD_APP_LOG} from './pkg/web-solutions/actions.js'
import {uiemit} from './pkg/web-solutions/server.js'

// eslint-disable-next-line no-promise-executor-return
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function load(ms: number, message: string) {
  const spinner = createSpinner(message)
  spinner.start()
  await sleep(ms)
  spinner.stop()
}

export async function webTypeSelector() {
  const promptSelect = await inquirer.prompt([
    {
      choices: ['op1', 'op2', 'op3'],
      message: 'Question',
      name: 'selected',
      type: 'list',
    },
  ])
  return promptSelect.selected
}

export const logRegisteredMicro = (path: string, name: string) =>
  console.log(
    `[${dayjs().format('HH:mm:ss')}]${kleur.green('[INFO]')} Registered ${kleur.cyan('path')}=${path} ${kleur.cyan(
      'service',
    )}=${name}`,
  )

export const info = (title: string, message: string): string =>
  `[${dayjs().format('HH:mm:ss')}]${kleur.yellow('[INFO]')}[${kleur.green(title)}] ${message}`

export const error = (title: string, message: string): string =>
  `[${dayjs().format('HH:mm:ss')}]${kleur.red('[ERROR]')}[${kleur.green(title)}] ${message}`

export const warn = (title: string, message: string): string =>
  `[${dayjs().format('HH:mm:ss')}]${kleur.bgYellow('[WARN]')}[${kleur.green(title)}] ${message}`

// log for CLI and emit to UI
export const logger = (type: Log, title: string, message: string): void => {
  switch (type) {
    case 'info': {
      console.log(info(title, message))
      uiemit({
        payload: {
          message,
          title,
          type,
        },
        type: ADD_APP_LOG,
      })
      break
    }

    case 'error': {
      console.log(error(title, message))
      uiemit({
        payload: {
          message,
          title,
          type,
        },
        type: ADD_APP_LOG,
      })
      break
    }

    case 'warn': {
      console.log(warn(title, message))
      uiemit({
        payload: {
          message,
          title,
          type,
        },
        type: ADD_APP_LOG,
      })
      break
    }

    default: {
      break
    }
  }
}

export const asyncSend = (worker: ChildProcess, data: Record<string, unknown>) =>
  new Promise((resolve, reject) => {
    const messageId = randomUUID()
    evt.once(`resolved-${messageId}`, (payload) => {
      resolve(payload)
    })
    worker.send({...data, __id: messageId}, (error) => {
      if (error) {
        reject(error)
      }
    })
  })

export const gitClone = async (targetRepo: string, dir: string) => {
  const emitter: any = tiged(targetRepo, {
    disableCache: true,
    force: true,
  })
  emitter.on('info', () => {})
  await emitter.clone(dir)
}

export const getServicePath = (isWorker: boolean, projectPath: string, serviceName: string) => {
  const servicePaths = [projectPath]
  if (isWorker) {
    servicePaths.push('services')
  }

  servicePaths.push(serviceName)
  return path.join(...servicePaths)
}
