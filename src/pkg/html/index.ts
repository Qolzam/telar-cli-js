import {pathExists} from 'fs-extra'
import {minify} from 'html-minifier-terser'
import {WriteStream, createWriteStream} from 'node:fs'
import {readFile} from 'node:fs/promises'
import * as path from 'node:path'

import shell from '../shell/index.js'

function writeJSTemplate(fileName: string, file: string, writableStream: WriteStream) {
  const minifiedHTML = minify(file, {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    useShortDoctype: true,
  })
  const htmlFile = `\n
   '${fileName}': \`${minifiedHTML}\`,
  `
  writableStream.write(htmlFile)
}

export const compileTemplate = async (targetPath: string) => {
  if (!targetPath) {
    throw new Error('Path is require!')
  }

  const targetPathExist = await pathExists(targetPath)
  if (!targetPathExist) {
    throw new Error(
      `The target platform '${targetPath}' does not exist in platform directory! Did you misspell your target path?`,
    )
  }

  const currentDirectory = shell.pwd()
  const htmlFiles = await shell.ls(path.join(targetPath, '*.html'))
  const $readFiles = []
  const indexFilePath = path.join(currentDirectory, 'index.ts')
  // const indexFilePathExist = await fs.pathExists(indexFilePath)
  // if (indexFilePathExist) {
  //   await fs.remove(indexFilePath)
  // }
  const writableStream = createWriteStream(indexFilePath)
  writableStream.setDefaultEncoding('utf8')

  writableStream.write(`
  import * as handlebars from 'handlebars';

    const htmlFiles = { \n
  `)

  for (const file of htmlFiles) {
    $readFiles.push(
      readFile(file, 'utf8').then((fileContent) => {
        writeJSTemplate(path.parse(file).name, fileContent, writableStream)
      }),
    )
  }

  await Promise.all($readFiles)
  const compileFunc = `\n

  }

  /**
   * Compile an auth page
   * @param {*} pageName 
   * @param {*} data 
   */
  export function compileAuthPage(pageName, data) {
      const template = handlebars.compile(htmlFiles[pageName]);
      return template(data);
  }

  `
  writableStream.write(compileFunc)
}
