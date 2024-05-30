import {glob} from 'glob'
import * as fs from 'node:fs'
import * as path from 'node:path'

interface LsOptions {
  depth?: null | number
  dirsOnly?: boolean
  filesOnly?: boolean
}

export async function ls(directoryPath: string = '.', options: LsOptions = {}): Promise<string[]> {
  const pattern = '/*'.repeat(options.depth || 1)

  try {
    const matches = await glob(directoryPath + pattern, {cwd: directoryPath, dot: true})
    let filteredMatches = matches.map((filePath) => path.resolve(directoryPath, filePath))
    if (options.dirsOnly) {
      filteredMatches = filteredMatches.filter((filePath) => {
        try {
          return fs.statSync(filePath).isDirectory()
        } catch {
          return false
        }
      })
    } else if (options.filesOnly) {
      filteredMatches = filteredMatches.filter((filePath) => {
        try {
          return fs.statSync(filePath).isFile()
        } catch {
          return false
        }
      })
    }

    return filteredMatches
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

// // Example usage:
// async function test() {
//   try {
//     const directories = await ls('/path/to/directory', {depth: 2, dirsOnly: true})
//     console.log('Directories:')
//     console.log(directories)

//     const files = await ls('/path/to/directory', {filesOnly: true})
//     console.log('\nFiles:')
//     console.log(files)
//   } catch (error) {
//     console.error('Error:', error)
//   }
// }

// test()
