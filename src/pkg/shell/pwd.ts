import path from 'node:path'

export function pwd(): string {
  const pwd = path.resolve(process.cwd())
  return pwd
}
