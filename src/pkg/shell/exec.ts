import * as child from 'node:child_process'

interface ExecOptions {
  cwd?: string
  encoding?: BufferEncoding
  env?: NodeJS.ProcessEnv
  maxBuffer?: number
  silent?: boolean
}

interface ExecResult {
  code: number
  stderr: string
  stdout: string
}

const DEFAULT_MAXBUFFER_SIZE = 20 * 1024 * 1024

async function execAsync(cmd: string, opts?: ExecOptions): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    opts = {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: process.env,
      maxBuffer: DEFAULT_MAXBUFFER_SIZE,
      silent: false,
      ...opts,
    }

    const c = child.exec(cmd, opts, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      } else {
        resolve({code: 0, stderr, stdout})
      }
    })

    if (!opts.silent && c.stdout && c.stderr) {
      c.stdout.pipe(process.stdout)
      c.stderr.pipe(process.stderr)
    }
  })
}

export async function exec(command: string, options?: ExecOptions): Promise<ExecResult> {
  options = {
    silent: false,
    ...options,
  }

  if (!command) {
    throw new Error('must specify command')
  }

  return execAsync(command, options)
}
