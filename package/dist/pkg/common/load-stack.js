"use strict";
// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadStack = void 0;
const yaml_1 = require("./yaml");
const providerName = 'telar';
/**
 * Load environments from file path list
 * @param {string[]} pathList list environment file path to load
 * @returns {*} environments
 */
const loadEnvironmentFiles = (pathList) => {
    let environment = {};
    for (const item of pathList) {
        const envObj = (0, yaml_1.loadYaml)(item);
        if (!envObj.environment) {
            throw new Error(`Can not find [environment] field in [${item}].`);
        }
        environment = { ...environment, ...envObj.environment };
    }
    return environment;
};
/**
 * Load secrets from file path list
 * @param {string[]} pathList list secret file path to load
 * @returns {*} secrets
 */
const loadSecretFiles = (pathList) => {
    let secret = {};
    for (const item of pathList) {
        const envObj = (0, yaml_1.loadYaml)(item);
        if (!envObj.secret) {
            throw new Error(`Can not find [secret] field in [${item}].`);
        }
        secret = { ...secret, ...envObj.secret };
    }
    return secret;
};
/**
 * Load the stack file
 * @param {string} stackPath the stack file path
 * @returns {SyncStackFile} sync stack file
 */
const loadStack = (stackPath) => {
    const stack = (0, yaml_1.loadYaml)(stackPath);
    if (stack.provider.name !== providerName) {
        throw new Error(`We do not support provider name [${providerName}]. You need to change provider name in ${stackPath} to suported provider like [telar].`);
    }
    const { functions } = stack;
    if (!functions || Object.keys(functions).length === 0) {
        throw new Error(`There is no function defined in stack file ${stackPath}.`);
    }
    const syncStack = {
        provider: stack.provider,
        functions: {},
    };
    const fnNames = Object.keys(functions);
    for (const fnName of fnNames) {
        const fn = functions[fnName];
        let environment = {};
        syncStack.functions[fnName] = { environment: {}, secret: {}, bootstrap: fn.bootstrap };
        if (fn.environment_file && fn.environment_file.length > 0) {
            environment = loadEnvironmentFiles(fn.environment_file);
        }
        if (fn.environment) {
            environment = { ...environment, ...fn.environment };
        }
        syncStack.functions[fnName].environment = environment;
        if (fn.secret_file) {
            syncStack.functions[fnName].secret = loadSecretFiles(fn.secret_file);
        }
    }
    return syncStack;
};
exports.loadStack = loadStack;
