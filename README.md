mynewcli
=================

A new CLI generated with oclif


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/mynewcli.svg)](https://npmjs.org/package/mynewcli)
[![Downloads/week](https://img.shields.io/npm/dw/mynewcli.svg)](https://npmjs.org/package/mynewcli)


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
$ telar (--version)
telar-cli/0.19.0 darwin-arm64 node-v21.5.0
$ telar --help [COMMAND]
USAGE
  $ telar COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`telar create SOLUTION`](#telar-create-solution)
* [`telar help [COMMAND]`](#telar-help-command)
* [`telar html [ARG0] [PATH]`](#telar-html-arg0-path)
* [`telar platform [ARG1] [ARG2]`](#telar-platform-arg1-arg2)
* [`telar plugins`](#telar-plugins)
* [`telar plugins add PLUGIN`](#telar-plugins-add-plugin)
* [`telar plugins:inspect PLUGIN...`](#telar-pluginsinspect-plugin)
* [`telar plugins install PLUGIN`](#telar-plugins-install-plugin)
* [`telar plugins link PATH`](#telar-plugins-link-path)
* [`telar plugins remove [PLUGIN]`](#telar-plugins-remove-plugin)
* [`telar plugins reset`](#telar-plugins-reset)
* [`telar plugins uninstall [PLUGIN]`](#telar-plugins-uninstall-plugin)
* [`telar plugins unlink [PLUGIN]`](#telar-plugins-unlink-plugin)
* [`telar plugins update`](#telar-plugins-update)
* [`telar run`](#telar-run)
* [`telar seal [FILE]`](#telar-seal-file)
* [`telar service [CALL] [PATH]`](#telar-service-call-path)
* [`telar solution`](#telar-solution)
* [`telar sync [TARGET]`](#telar-sync-target)

## `telar create SOLUTION`

Create a project from a template

```
USAGE
  $ telar create SOLUTION [-d <value>] [-f <value>] [-g <value>] [-h] [-o <value>] [-t <value>]

ARGUMENTS
  SOLUTION  Solution name to create a project

FLAGS
  -d, --dir=<value>       Aternative direcoty to telar solutions repository
  -f, --file=<value>      Alternative to default telar store repository. The path example `path/to/solution.json`
  -g, --git=<value>
  -h, --help              Show CLI help.
  -o, --output=<value>    [default: .]
  -t, --template=<value>

DESCRIPTION
  Create a project from a template

EXAMPLES
  $ telar create telar-social
```

_See code: [src/commands/create.ts](https://github.com/Qolzam/telar-cli-js/blob/v0.19.0/src/commands/create.ts)_

## `telar help [COMMAND]`

Display help for telar.

```
USAGE
  $ telar help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for telar.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.0.21/src/commands/help.ts)_

## `telar html [ARG0] [PATH]`

compile html template file to a Javascript compile function

```
USAGE
  $ telar html [ARG0] [PATH] [-h]

FLAGS
  -h, --help  Show CLI help.

DESCRIPTION
  compile html template file to a Javascript compile function

EXAMPLES
  $ telar html compile ./auth
```

_See code: [src/commands/html.ts](https://github.com/Qolzam/telar-cli-js/blob/v0.19.0/src/commands/html.ts)_

## `telar platform [ARG1] [ARG2]`

Fetch platforms which using @telar/core project

```
USAGE
  $ telar platform [ARG1] [ARG2] [-h]

FLAGS
  -h, --help  Show CLI help.

DESCRIPTION
  Fetch platforms which using @telar/core project

EXAMPLES
  $ telar platform

  $ telar platform pull https://github.com/Qolzam/platforms.git
```

_See code: [src/commands/platform.ts](https://github.com/Qolzam/telar-cli-js/blob/v0.19.0/src/commands/platform.ts)_

## `telar plugins`

List installed plugins.

```
USAGE
  $ telar plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ telar plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/index.ts)_

## `telar plugins add PLUGIN`

Installs a plugin into telar.

```
USAGE
  $ telar plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into telar.

  Uses bundled npm executable to install plugins into /Users/qolzam/.local/share/telar

  Installation of a user-installed plugin will override a core plugin.

  Use the TELAR_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the TELAR_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ telar plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ telar plugins add myplugin

  Install a plugin from a github url.

    $ telar plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ telar plugins add someuser/someplugin
```

## `telar plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ telar plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ telar plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/inspect.ts)_

## `telar plugins install PLUGIN`

Installs a plugin into telar.

```
USAGE
  $ telar plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into telar.

  Uses bundled npm executable to install plugins into /Users/qolzam/.local/share/telar

  Installation of a user-installed plugin will override a core plugin.

  Use the TELAR_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the TELAR_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ telar plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ telar plugins install myplugin

  Install a plugin from a github url.

    $ telar plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ telar plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/install.ts)_

## `telar plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ telar plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ telar plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/link.ts)_

## `telar plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ telar plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ telar plugins unlink
  $ telar plugins remove

EXAMPLES
  $ telar plugins remove myplugin
```

## `telar plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ telar plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/reset.ts)_

## `telar plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ telar plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ telar plugins unlink
  $ telar plugins remove

EXAMPLES
  $ telar plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/uninstall.ts)_

## `telar plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ telar plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ telar plugins unlink
  $ telar plugins remove

EXAMPLES
  $ telar plugins unlink myplugin
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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.0.19/src/commands/plugins/update.ts)_

## `telar run`

run a server for Telar micro-services

```
USAGE
  $ telar run [-d <value>] [-h] [-p <value>] [-s <value>]

FLAGS
  -d, --dir=<value>...  [default: ] The directory for micro-services
  -h, --help            Show CLI help.
  -p, --port=<value>    [default: 3000] The port that server listen to
  -s, --server=<value>  External server path

DESCRIPTION
  run a server for Telar micro-services

EXAMPLES
  $ telar run
```

_See code: [src/commands/run.ts](https://github.com/Qolzam/telar-cli-js/blob/v0.19.0/src/commands/run.ts)_

## `telar seal [FILE]`

add a server-less target

```
USAGE
  $ telar seal [FILE] [-c <value>] [-i <value>] [-g <value>] [-h] [-l <value>] [-o <value>] [--pk-base64]

FLAGS
  -c, --cert=<value>          [default: secret-public.key] The path to the public key file. Default is secret-public.key
  -g, --gen=<value>           Generate key pair
  -h, --help                  Show CLI help.
  -i, --from-file=<value>...  Secret literal key-value data
  -l, --literal=<value>...    Secret literal key-value data
  -o, --output-file=<value>   [default: secrets.yml] Output file for secrets
      --pk-base64             Whether generate base64 version of private key or not

DESCRIPTION
  add a server-less target

EXAMPLES
    telar seal --literal db-pass=p@55w0rd
    telar seal --from-file api-key.txt
    telar seal --literal a=b --literal c=d --cert public.key --output-file secrets.yml
    telar seal --gen secret --pk-base64
```

_See code: [src/commands/seal.ts](https://github.com/Qolzam/telar-cli-js/blob/v0.19.0/src/commands/seal.ts)_

## `telar service [CALL] [PATH]`

run a service

```
USAGE
  $ telar service [CALL] [PATH] [--config <value>] [-h]

FLAGS
  -h, --help            Show CLI help.
  --config=<value>

DESCRIPTION
  run a service

EXAMPLES
  $ telar service run .
```

_See code: [src/commands/service.ts](https://github.com/Qolzam/telar-cli-js/blob/v0.19.0/src/commands/service.ts)_

## `telar solution`

Manage solutions

```
USAGE
  $ telar solution [-h]

FLAGS
  -h, --help  Show CLI help.

DESCRIPTION
  Manage solutions

EXAMPLES
  $ telar solution
```

_See code: [src/commands/solution.ts](https://github.com/Qolzam/telar-cli-js/blob/v0.19.0/src/commands/solution.ts)_

## `telar sync [TARGET]`

sync @telar/core project with target platform

```
USAGE
  $ telar sync [TARGET] [-f <value>] [-h]

FLAGS
  -f, --file=<value>  [default: stack.yml] Stack file path
  -h, --help          Show CLI help.

DESCRIPTION
  sync @telar/core project with target platform

EXAMPLES
  $ telar sync vercel
```

_See code: [src/commands/sync.ts](https://github.com/Qolzam/telar-cli-js/blob/v0.19.0/src/commands/sync.ts)_
<!-- commandsstop -->
