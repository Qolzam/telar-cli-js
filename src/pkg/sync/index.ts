import * as fs from 'fs-extra'
import * as path from 'node:path'
import jsonFile from 'jsonfile'

import shell from '../shell/index.js'

export const sync = async (target: string, stackPath: string) => {
  const currentDirctory = shell.pwd()
  const platformRoot = path.join(currentDirctory, 'platform')
  const targetPath = path.join(platformRoot, target)
  const resolvePath = path.join(targetPath, 'build', 'index.js')

  const platformRootExist = await fs.pathExists(platformRoot)
  if (!platformRootExist) {
    throw new Error(
      "The platform directory does not exist! Did you forget to pull the platforms by 'telar platform' command?",
    )
  }

  const targetPathExist = await fs.pathExists(targetPath)

  if (!targetPathExist) {
    throw new Error(
      `The target platform '${target}' does not exist in platform directory! Did you misspell your target platform?`,
    )
  }

  const resolvePathExist = await fs.pathExists(resolvePath)
  if (!resolvePathExist) {
    throw new Error(`The resolve path for platform '${target}' does not exist in ${resolvePath}!`)
  }

  const targetPlatform = await jsonFile.readFile(resolvePath, {encoding: 'utf8'})
  targetPlatform.sync(stackPath)
}
