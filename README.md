# telar-cli

Telar necessary tools

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/telar-cli.svg)](https://npmjs.org/package/telar-cli)
[![CircleCI](https://circleci.com/gh/Qolzam/telar-cli-js/tree/main.svg?style=shield)](https://circleci.com/gh/Qolzam/telar-cli-js/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/telar-cli.svg)](https://npmjs.org/package/telar-cli)
[![License](https://img.shields.io/npm/l/telar-cli.svg)](https://github.com/Qolzam/telar-cli/blob/main/package.json)

<!-- toc -->
* [telar-cli](#telar-cli)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g telar-cli
$ telar COMMAND
running command...
$ telar (--version)
telar-cli/0.3.0 darwin-arm64 node-v16.13.1
$ telar --help [COMMAND]
USAGE
  $ telar COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`telar help [COMMAND]`](#telar-help-command)
* [`telar plugins`](#telar-plugins)
* [`telar plugins:install PLUGIN...`](#telar-pluginsinstall-plugin)
* [`telar plugins:inspect PLUGIN...`](#telar-pluginsinspect-plugin)
* [`telar plugins:install PLUGIN...`](#telar-pluginsinstall-plugin-1)
* [`telar plugins:link PLUGIN`](#telar-pluginslink-plugin)
* [`telar plugins:uninstall PLUGIN...`](#telar-pluginsuninstall-plugin)
* [`telar plugins:uninstall PLUGIN...`](#telar-pluginsuninstall-plugin-1)
* [`telar plugins:uninstall PLUGIN...`](#telar-pluginsuninstall-plugin-2)
* [`telar plugins update`](#telar-plugins-update)

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
<!-- commandsstop -->
