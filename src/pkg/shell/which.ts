import fs from 'node:fs'
import path from 'node:path'

type WhichOptions = {
  a?: boolean
}

const XP_DEFAULT_PATHEXT = '.com;.exe;.bat;.cmd;.vbs;.vbe;.js;.jse;.wsf;.wsh'
const FILE_EXECUTABLE_MODE = fs.constants.X_OK // Use fs.constants.X_OK for executable mode

function isWindowsPlatform(): boolean {
  return process.platform === 'win32'
}

function splitPath(p: string): string[] {
  return p ? p.split(path.delimiter) : []
}

async function isExecutable(pathName: string): Promise<boolean> {
  try {
    await fs.promises.access(pathName, FILE_EXECUTABLE_MODE)
    return true
  } catch {
    return false
  }
}

async function checkPath(pathName: string): Promise<boolean> {
  try {
    const stats = await fs.promises.lstat(pathName)
    return !stats.isDirectory() && (isWindowsPlatform() || (await isExecutable(pathName)))
  } catch {
    return false
  }
}

export async function which(options: WhichOptions, cmd: string): Promise<null | string | string[]>
export async function which(cmd: string, options?: WhichOptions): Promise<null | string | string[]>
export async function which(
  arg1: WhichOptions | string,
  arg2?: WhichOptions | string,
): Promise<null | string | string[]> {
  let cmd: string
  let options: WhichOptions

  if (typeof arg1 === 'string') {
    cmd = arg1
    options = (arg2 as WhichOptions) || {}
  } else {
    options = arg1 as WhichOptions
    cmd = arg2 as string
  }

  if (!cmd) throw new Error('must specify command')

  const isWindows = isWindowsPlatform()
  const pathArray = splitPath(process.env.PATH || '')

  const queryMatches: string[] = []

  if (!cmd.includes('/')) {
    let pathExtArray = ['']
    if (isWindows) {
      const pathExtEnv = process.env.PATHEXT || XP_DEFAULT_PATHEXT
      pathExtArray = splitPath(pathExtEnv.toUpperCase())
    }

    await Promise.all(
      pathArray.map(async (p) => {
        if (queryMatches.length > 0 && !options.a) return

        let attempt = path.resolve(p, cmd)

        if (isWindows) {
          attempt = attempt.toUpperCase()
        }

        const match = attempt.match(/\.[^"*./:<>?|]+$/)
        if (match && pathExtArray.includes(match[0])) {
          if (await checkPath(attempt)) {
            queryMatches.push(attempt)
          }
        } else {
          await Promise.all(
            pathExtArray.map(async (ext) => {
              const newAttempt = attempt + ext
              if (await checkPath(newAttempt)) {
                queryMatches.push(newAttempt)
              }
            }),
          )
        }
      }),
    )
  } else if (await checkPath(cmd)) {
    queryMatches.push(path.resolve(cmd))
  }

  return options.a ? queryMatches : queryMatches[0] || null
}
