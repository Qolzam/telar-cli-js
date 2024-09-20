import {ChildProcess} from 'node:child_process'

import {ServiceCallInfo, ServiceStatus} from '../common/types.js'

interface ServiceCacheItem {
  callInfo?: ServiceCallInfo
  config: {[key: string]: string}
  process?: ChildProcess
  status?: ServiceStatus
}

const serviceCache: {[key: string]: ServiceCacheItem} = {}

export const ServiceCache = {
  /**
   * Get the configuration of a service.
   * @param name The name of the service.
   * @return The configuration of the service, if it exists; otherwise undefined.
   */
  getConfig(name: string): {[key: string]: string} | undefined {
    if (serviceCache[name]) {
      return serviceCache[name].config
    }

    return undefined
  },

  /**
   * Get a service by its name.
   * @param name The name of the service.
   * @return The service, if it exists; otherwise undefined.
   */
  getService(name: string): ServiceCacheItem | undefined {
    return serviceCache[name]
  },

  /**
   * Get the call information of a service.
   * @param name The name of the service.
   * @return The call information object, if it exists; otherwise undefined.
   */
  getServiceCallInfo(name: string): ServiceCallInfo | undefined {
    return serviceCache[name]?.callInfo
  },

  /**
   * Get all services in the cache.
   * @return An object containing all services in the cache.
   */
  getServices(): {[key: string]: ServiceCacheItem} {
    return serviceCache
  },

  /**
   * Remove a service from the cache.
   * @param name The name of the service to remove.
   * @returns void
   */
  removeService(name: string): void {
    delete serviceCache[name]
  },

  /**
   * Set the child process associated with a service.
   * @param name The name of the service.
   * @param process The child process.
   * @return void
   */
  setProcess(name: string, process: ChildProcess): void {
    if (serviceCache[name]) {
      serviceCache[name].process = process
    } else {
      console.error(`Service '${name}' does not exist.`)
    }
  },

  /**
   * Set a service in the cache.
   * @param name The name of the service.
   * @param service The service data.
   * @return void
   */
  setService(name: string, service: ServiceCacheItem | object): void {
    serviceCache[name] = {...serviceCache[name], ...service}
  },

  /**
   * Set the call information of a service.
   * @param name The name of the service.
   * @param callInfo The call information object.
   * @return void
   */
  setServiceCallInfo(name: string, callInfo: ServiceCallInfo): void {
    if (serviceCache[name]) {
      serviceCache[name].callInfo = callInfo
    } else {
      console.error(`Service '${name}' does not exist.`)
    }
  },

  /**
   * Set the configuration of a service.
   * @param name The name of the service.
   * @param config The configuration object.
   * @return void
   */
  setServiceConfig(name: string, config: {[key: string]: string}): void {
    if (serviceCache[name]) {
      serviceCache[name].config = config
    } else {
      console.error(`Service '${name}' does not exist.`)
    }
  },

  /**
   * Set the status of a service.
   * @param name The name of the service.
   * @param status The status object.
   * @return void
   */
  setServiceStatus(name: string, status: ServiceStatus): void {
    if (serviceCache[name]) {
      serviceCache[name].status = status
    } else {
      console.error(`Service '${name}' does not exist.`)
    }
  },
}
