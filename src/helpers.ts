import * as kleur from 'kleur'
import * as dayjs from 'dayjs'
import {uiemit} from './pkg/web-solutions/server'
import {ADD_APP_LOG} from './pkg/web-solutions/actions'
import {Log} from './pkg/common/types'
import {ChildProcess} from 'node:child_process'
import {randomUUID} from 'node:crypto'
import evt from './pkg/common/events'

export const info = (title: string, message: string): string => {
  return `[${dayjs().format('HH:mm:ss')}]${kleur.yellow('[INFO]')}[${kleur.green(title)}] ${message}`
}

export const error = (title: string, message: string): string => {
  return `[${dayjs().format('HH:mm:ss')}]${kleur.red('[ERROR]')}[${kleur.green(title)}] ${message}`
}

export const warn = (title: string, message: string): string => {
  return `[${dayjs().format('HH:mm:ss')}]${kleur.bgYellow('[WARN]')}[${kleur.green(title)}] ${message}`
}

// log for CLI and emit to UI
export const logger = (type: Log, title: string, message: string): void => {
  switch (type) {
  case 'info':
    console.log(info(title, message))
    uiemit({
      type: ADD_APP_LOG,
      payload: {
        type,
        title,
        message,
      },
    })
    break
  case 'error':
    console.log(error(title, message))
    uiemit({
      type: ADD_APP_LOG,
      payload: {
        type,
        title,
        message,
      },
    })
    break
  case 'warn':
    console.log(warn(title, message))
    uiemit({
      type: ADD_APP_LOG,
      payload: {
        type,
        title,
        message,
      },
    })
    break

  default:
    break
  }
}

export const asyncSend = (worker: ChildProcess, data: any) => {
  return new Promise((resolve, reject) => {
    const messageId = randomUUID()
    evt.once(`resolved-${messageId}`, payload => {
      resolve(payload)
    })
    worker.send({...data, __id: messageId}, error => {
      if (error) {
        reject(error)
      }
    })
  })
}
