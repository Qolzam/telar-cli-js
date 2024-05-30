// Modified from https://github.com/shelljs/shelljs/blob/master/src/cd.js
// BSD 3-Clause License
// Copyright (c) 2012, Artur Adib <arturadib@gmail.com>

import os from 'node:os'

export function cd(dir?: string): string {
  if (!dir) dir = os.homedir()
  if (dir === '-') {
    if (process.env.OLDPWD) {
      dir = process.env.OLDPWD
    } else {
      throw new Error('Could not find previous directory.')
    }
  }

  const prevDir = process.cwd()
  process.chdir(dir)
  process.env.OLDPWD = prevDir
  return ''
}
