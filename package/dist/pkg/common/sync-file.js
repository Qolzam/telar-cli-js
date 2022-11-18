"use strict";
// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncEnvironment = exports.syncSecret = void 0;
const fs = require("fs");
const yaml_1 = require("./yaml");
const syncSecret = (sourcePath, targetPath) => {
    const loadedYaml = (0, yaml_1.loadYaml)(sourcePath);
    fs.writeFileSync(targetPath, loadedYaml, 'utf8');
};
exports.syncSecret = syncSecret;
const syncEnvironment = (sourcePath, targetPath) => {
    const loadedYaml = (0, yaml_1.loadYaml)(sourcePath);
    fs.writeFileSync(targetPath, loadedYaml, 'utf8');
};
exports.syncEnvironment = syncEnvironment;
