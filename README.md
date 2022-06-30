# telar-cli

Telar necessary tools

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/telar-cli.svg)](https://npmjs.org/package/telar-cli)
[![CircleCI](https://circleci.com/gh/Qolzam/telar-cli-js/tree/main.svg?style=shield)](https://circleci.com/gh/Qolzam/telar-cli-js/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/telar-cli.svg)](https://npmjs.org/package/telar-cli)
[![License](https://img.shields.io/npm/l/telar-cli.svg)](https://github.com/Qolzam/telar-cli/blob/main/package.json)

<!-- toc -->

- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g telar-cli
$ telar COMMAND
running command...
$ telar (--version)
telar-cli/0.2.0 linux-x64 node-v16.15.0
$ telar --help [COMMAND]
USAGE
  $ telar COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`telar help [COMMAND]`](#telar-help-command)
- [`telar html [ARG0] [PATH]`](#telar-html-arg0-path)
- [`telar platform [ARG1] [ARG2]`](#telar-platform-arg1-arg2)
- [`telar plugins`](#telar-plugins)
- [`telar plugins:install PLUGIN...`](#telar-pluginsinstall-plugin)
- [`telar plugins:inspect PLUGIN...`](#telar-pluginsinspect-plugin)
- [`telar plugins:install PLUGIN...`](#telar-pluginsinstall-plugin-1)
- [`telar plugins:link PLUGIN`](#telar-pluginslink-plugin)
- [`telar plugins:uninstall PLUGIN...`](#telar-pluginsuninstall-plugin)
- [`telar plugins:uninstall PLUGIN...`](#telar-pluginsuninstall-plugin-1)
- [`telar plugins:uninstall PLUGIN...`](#telar-pluginsuninstall-plugin-2)
- [`telar plugins update`](#telar-plugins-update)
- [`telar proxy`](#telar-proxy)
- [`telar sync [TARGET]`](#telar-sync-target)

## `telar help [COMMAND]`

Display help for telar.

```
USAGE
  $ telar help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for telar.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.10/src/commands/help.ts)_

## `telar html [ARG0] [PATH]`

compile html template file to a Javascript compile function

```
USAGE
  $ telar html [ARG0] [PATH] [-h]

FLAGS
  -h, --help  show CLI help

DESCRIPTION
  compile html template file to a Javascript compile function

EXAMPLES
  $ telar html compile ./auth
```

_See code: [dist/commands/html.ts](https://github.com/Qolzam/telar-cli-js/blob/v0.2.0/dist/commands/html.ts)_

## `telar platform [ARG1] [ARG2]`

Fetch platforms which using @telar/core project

```
USAGE
  $ telar platform [ARG1] [ARG2] [-h]

FLAGS
  -h, --help  show CLI help

DESCRIPTION
  Fetch platforms which using @telar/core project

EXAMPLES
  $ telar platform

  $ telar platform pull https://github.com/Qolzam/platforms.git
```

_See code: [dist/commands/platform.ts](https://github.com/Qolzam/telar-cli-js/blob/v0.2.0/dist/commands/platform.ts)_

## `telar plugins`

List installed plugins.

```
USAGE
  $ telar plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ telar plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.11/src/commands/plugins/index.ts)_

## `telar plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ telar plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ telar plugins add

EXAMPLES
  $ telar plugins:install myplugin

  $ telar plugins:install https://github.com/someuser/someplugin

  $ telar plugins:install someuser/someplugin
```

## `telar plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ telar plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ telar plugins:inspect myplugin
```

## `telar plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ telar plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ telar plugins add

EXAMPLES
  $ telar plugins:install myplugin

  $ telar plugins:install https://github.com/someuser/someplugin

  $ telar plugins:install someuser/someplugin
```

## `telar plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ telar plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ telar plugins:link myplugin
```

## `telar plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ telar plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ telar plugins unlink
  $ telar plugins remove
```

## `telar plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ telar plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ telar plugins unlink
  $ telar plugins remove
```

## `telar plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ telar plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ telar plugins unlink
  $ telar plugins remove
```

## `telar plugins update`

Update installed plugins.

```
USAGE
  $ telar plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

## `telar proxy`

run a proxy server

```
USAGE
  $ telar proxy [-h] [-p <value>] [-t <value>]

FLAGS
  -h, --help            show CLI help
  -p, --port=<value>    [default: 80] Income port
  -t, --target=<value>  [default: http://social.example.com:4000] Proxy server target

DESCRIPTION
  run a proxy server

EXAMPLES
  $ telar proxy -p 80 -t http://social.example.com:4000
```

_See code: [dist/commands/proxy.ts](https://github.com/Qolzam/telar-cli-js/blob/v0.2.0/dist/commands/proxy.ts)_

## `telar sync [TARGET]`

sync @telar/core project with target platform

```
USAGE
  $ telar sync [TARGET] [-h] [-f <value>]

FLAGS
  -f, --file=<value>  [default: stack.yml] Stack file path
  -h, --help          show CLI help

DESCRIPTION
  sync @telar/core project with target platform

EXAMPLES
  $ telar sync vercel
```

_See code: [dist/commands/sync.ts](https://github.com/Qolzam/telar-cli-js/blob/v0.2.0/dist/commands/sync.ts)_

<!-- commandsstop -->
