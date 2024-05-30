import * as path from 'node:path'

const arrayToRegExp = (arr: string[]): RegExp => {
  const reg = arr
    .map((file) => {
      if (/^\./.test(file)) {
        return `\\${file}`
      }

      return file
    })
    .join('|')
  return new RegExp(`(${reg})`)
}

const logWatchVerbose = (event: string, filepath: string): void => {
  const relativeFilepath = path.relative(process.cwd(), filepath)
  console.log(`[fastify-cli] watch - '${event}' occurred on '${relativeFilepath}'`)
}

export {arrayToRegExp, logWatchVerbose}
