// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import {StackFile, SyncStackFile} from './types.js'
import {loadYaml} from './yaml.js'
const providerName = 'telar'

/**
 * Load environments from file path list
 * @param {string[]} pathList list environment file path to load
 * @returns {*} environments
 */
const loadEnvironmentFiles = (pathList: string[]) => {
  let environment = {}
  for (const item of pathList) {
    const envObj = loadYaml(item) as {environment: any}
    if (!envObj.environment) {
      throw new Error(`Can not find [environment] field in [${item}].`)
    }

    environment = {...environment, ...envObj.environment}
  }

  return environment
}

/**
 * Load secrets from file path list
 * @param {string[]} pathList list secret file path to load
 * @returns {*} secrets
 */
const loadSecretFiles = (pathList: string[]) => {
  let secret = {}
  for (const item of pathList) {
    const envObj = loadYaml(item) as {secret: any}
    if (!envObj.secret) {
      throw new Error(`Can not find [secret] field in [${item}].`)
    }

    secret = {...secret, ...envObj.secret}
  }

  return secret
}

/**
 * Load the stack file
 * @param {string} stackPath the stack file path
 * @returns {SyncStackFile} sync stack file
 */
export const loadStack = (stackPath: string) => {
  const stack: StackFile = loadYaml(stackPath) as StackFile
  if (stack.provider.name !== providerName) {
    throw new Error(`We do not support provider name [${providerName}]. You need to change provider name in ${stackPath} to suported provider like [telar].`)
  }

  const {functions} = stack
  if (!functions || Object.keys(functions).length === 0) {
    throw new Error(`There is no function defined in stack file ${stackPath}.`)
  }

  const syncStack: SyncStackFile = {
    functions: {},
    provider: stack.provider,
  }
  const fnNames = Object.keys(functions)

  for (const fnName of fnNames) {
    const fn = functions[fnName]
    let environment = {}
    syncStack.functions[fnName] = {bootstrap: fn.bootstrap, environment: {}, secret: {}}
    if (fn.environment_file && fn.environment_file.length > 0) {
      environment = loadEnvironmentFiles(fn.environment_file)
    }

    if (fn.environment) {
      environment = {...environment, ...fn.environment}
    }

    syncStack.functions[fnName].environment = environment

    if (fn.secret_file) {
      syncStack.functions[fnName].secret = loadSecretFiles(fn.secret_file)
    }
  }

  return syncStack
}

