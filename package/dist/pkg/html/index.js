"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileTemplate = void 0;
const fs = require("fs-extra");
const path = require("path");
const shell = require("shelljs");
const html_minifier_terser_1 = require("html-minifier-terser");
function writeJSTemplate(fileName, file, writableStream) {
    const minifiedHTML = (0, html_minifier_terser_1.minify)(file, {
        minifyCSS: true,
        minifyJS: true,
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeOptionalTags: true,
    });
    const htmlFile = `\n
   '${fileName}': \`${minifiedHTML}\`,
  `;
    writableStream.write(htmlFile);
}
const compileTemplate = async (targetPath) => {
    if (!targetPath) {
        throw new Error('Path is require!');
    }
    const targetPathExist = await fs.pathExists(targetPath);
    if (!targetPathExist) {
        throw new Error(`The target platform '${targetPath}' does not exist in platform directory! Did you misspell your target path?`);
    }
    const currentDirectory = shell.pwd().stdout;
    const htmlFiles = shell.ls(path.join(targetPath, '*.html'));
    const $readFiles = [];
    const indexFilePath = path.join(currentDirectory, 'index.ts');
    // const indexFilePathExist = await fs.pathExists(indexFilePath)
    // if (indexFilePathExist) {
    //   await fs.remove(indexFilePath)
    // }
    const writableStream = fs.createWriteStream(indexFilePath);
    writableStream.setDefaultEncoding('utf8');
    writableStream.write(`
  import * as handlebars from 'handlebars';

    const htmlFiles = { \n
  `);
    for (let index = 0; index < htmlFiles.length; index++) {
        const file = htmlFiles[index];
        $readFiles.push(fs.readFile(file, 'utf8').then(fileContent => {
            writeJSTemplate(path.parse(file).name, fileContent, writableStream);
        }));
    }
    await Promise.all($readFiles);
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

  `;
    writableStream.write(compileFunc);
};
exports.compileTemplate = compileTemplate;
