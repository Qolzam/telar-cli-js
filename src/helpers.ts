import dayjs from 'dayjs'
import inquirer from 'inquirer'
import kleur from 'kleur'
import {createSpinner} from 'nanospinner'
import {ChildProcess, exec} from 'node:child_process'
import {randomUUID} from 'node:crypto'
import fs from 'node:fs'
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

// a function to check if a directory does not exist create one
export const checkDirCreate = async (dir: string) => {
  try {
    await fs.promises.access(dir)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.promises.mkdir(dir, {recursive: true})
    }
  }
}

// a function run git clone command async using exec of child_process
export const gitClone = async (targetRepo: string, dir: string) =>
  new Promise((resolve, reject) => {
    // check if git is installed
    exec('git --version', (error) => {
      if (error) {
        // if git does not exist use git download function and warn to user
        logger(
          'warn',
          'Git not found',
          'Git is not installed. Using git download instead. In this case, the git history will not be cloned.',
        )
        gitDownload(targetRepo, dir).then((e) => {
          resolve(e)
        })
      } else {
        // check if the directory does not exist create one
        checkDirCreate(dir).then(() => {
          // run git clone command
          exec(`git clone ${targetRepo} ${dir}`, {}, (error, stdout) => {
            if (error) {
              reject(error)
            }

            resolve(stdout)
          })
        })
      }
    })
  })

export const gitDownload = async (targetRepo: string, dir: string) => {
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
