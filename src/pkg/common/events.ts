import * as events from 'node:events'
const event = new events.EventEmitter()
const evt = {
  on(eventName: string,  listener: (...args: any[]) => void): void {
    event.on(eventName, listener)
  },
  once(eventName: string,  listener: (...args: any[]) => void): void {
    event.once(eventName, listener)
  },
  send(eventName: string, action?: any): void {
    event.emit(eventName, action)
  },
}

export default evt
