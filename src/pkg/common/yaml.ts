// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as fs from 'node:fs'
import * as path from 'node:path'
import * as yaml from 'js-yaml'

/**
 * Create a yaml file
 * @param {*} data Data to parse in yaml
 * @param {string} filePath The file path to write the YAML file
 */
export const createYaml = (data: any, filePath: string) => {
  fs.writeFileSync(filePath, yaml.dump(data), 'utf8')
}

/**
 * Load yaml file
 * @param {string} filePath The file path to write the YAML file
 * @returns {*} yaml content in object
 */
export const loadYaml = (filePath: string) => {
  const doc = yaml.load(fs.readFileSync(path.resolve(filePath), 'utf8'))
  return doc
}
