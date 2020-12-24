telar-cli
=========

This is a CLI to scaffold, build and deploy a server-less project.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/telar-cli.svg)](https://npmjs.org/package/telar-cli)
[![Downloads/week](https://img.shields.io/npm/dw/telar-cli.svg)](https://npmjs.org/package/telar-cli)
[![License](https://img.shields.io/npm/l/telar-cli.svg)](https://github.com/Qolzam/telar-cli-js/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g telar-cli
$ telar COMMAND
running command...
$ telar (-v|--version|version)
telar-cli/0.0.3 darwin-x64 node-v12.16.1
$ telar --help [COMMAND]
USAGE
  $ telar COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`telar help [COMMAND]`](#telar-help-command)
* [`telar platform [ARG1] [ARG2]`](#telar-platform-arg1-arg2)
* [`telar seal [FILE]`](#telar-seal-file)
* [`telar sync [TARGET]`](#telar-sync-target)

## `telar help [COMMAND]`

display help for telar

```
USAGE
  $ telar help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

## `telar platform [ARG1] [ARG2]`

Fetch platforms which using @telar/core project

```
USAGE
  $ telar platform [ARG1] [ARG2]

OPTIONS
  -h, --help  show CLI help

EXAMPLES
  $ telar platform
  $ telar platform pull https://github.com/Qolzam/platforms.git
```

_See code: [src/commands/platform.ts](https://github.com/Qolzam/telar-cli-js/blob/v0.0.3/src/commands/platform.ts)_

## `telar seal [FILE]`

add a server-less target

```
USAGE
  $ telar seal [FILE]

OPTIONS
  -c, --cert=cert                The path to the public key file. Default is public.key
  -g, --gen                      Generate key pair
  -h, --help                     show CLI help
  -i, --from-file=from-file      Secret literal key-value data
  -l, --literal=literal          Secret literal key-value data
  -o, --output-file=output-file  Output file for secrets

EXAMPLE
     telar seal --literal db-pass=p@55w0rd
     telar seal --from-file api-key.txt
     telar seal --literal a=b --literal c=d --cert public.key --output-file secrets.yml
     telar seal --gen
```

_See code: [src/commands/seal.ts](https://github.com/Qolzam/telar-cli-js/blob/v0.0.3/src/commands/seal.ts)_

## `telar sync [TARGET]`

sync @telar/core project with target platform

```
USAGE
  $ telar sync [TARGET]

OPTIONS
  -f, --file=file  Stack file path
  -h, --help       show CLI help

EXAMPLE
  $ telar sync vercel
```

_See code: [src/commands/sync.ts](https://github.com/Qolzam/telar-cli-js/blob/v0.0.3/src/commands/sync.ts)_
<!-- commandsstop -->
