"use strict";
// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadYaml = exports.createYaml = void 0;
const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");
/**
 * Create a yaml file
 * @param {*} data Data to parse in yaml
 * @param {string} filePath The file path to write the YAML file
 */
const createYaml = (data, filePath) => {
    fs.writeFileSync(filePath, yaml.dump(data), 'utf8');
};
exports.createYaml = createYaml;
/**
 * Load yaml file
 * @param {string} filePath The file path to write the YAML file
 * @returns {*} yaml content in object
 */
const loadYaml = (filePath) => {
    const doc = yaml.load(fs.readFileSync(path.resolve(filePath), 'utf8'));
    return doc;
};
exports.loadYaml = loadYaml;
