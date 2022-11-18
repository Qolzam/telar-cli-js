"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sync = void 0;
const fs = require("fs-extra");
const path = require("path");
const shell = require("shelljs");
const sync = async (target, stackPath) => {
    const currentDirctory = shell.pwd().stdout;
    const platformRoot = path.join(currentDirctory, 'platform');
    const targetPath = path.join(platformRoot, target);
    const resolvePath = path.join(targetPath, 'build', 'index.js');
    const platformRootExist = await fs.pathExists(platformRoot);
    if (!platformRootExist) {
        throw new Error("The platform directory does not exist! Did you forget to pull the platforms by 'telar platform' command?");
    }
    const targetPathExist = await fs.pathExists(targetPath);
    if (!targetPathExist) {
        throw new Error(`The target platform '${target}' does not exist in platform directory! Did you misspell your target platform?`);
    }
    const resolvePathExist = await fs.pathExists(resolvePath);
    if (!resolvePathExist) {
        throw new Error(`The resolve path for platform '${target}' does not exist in ${resolvePath}!`);
    }
    const targetPlatform = await Promise.resolve().then(() => require(resolvePath));
    targetPlatform.sync(stackPath);
};
exports.sync = sync;
