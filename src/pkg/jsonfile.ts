import * as fs from 'node:fs'

// Define an interface for the options
interface ReadJsonOptions {
  encoding?: BufferEncoding
}

interface WriteJsonOptions {
  encoding?: BufferEncoding
  spaces?: number
}

async function readJsonFile<T>(filePath: string, options?: ReadJsonOptions): Promise<T> {
  const encoding = options?.encoding || 'utf8'

  return new Promise<T>((resolve, reject) => {
    fs.readFile(filePath, {encoding}, (err, data) => {
      if (err) {
        return reject(err)
      }

      try {
        const json = JSON.parse(data)
        resolve(json as T)
      } catch (error) {
        reject(error)
      }
    })
  })
}

async function writeJsonFile<T>(filePath: string, data: T, options?: WriteJsonOptions): Promise<void> {
  const encoding = options?.encoding || 'utf8'
  const spaces = options?.spaces || 2

  return new Promise<void>((resolve, reject) => {
    const jsonString = JSON.stringify(data, null, spaces)
    fs.writeFile(filePath, jsonString, {encoding}, (err) => {
      if (err) {
        return reject(err)
      }

      resolve()
    })
  })
}

export {readJsonFile, writeJsonFile}
