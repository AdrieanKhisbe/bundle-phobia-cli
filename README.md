# bundle-phobia-cli

[![npm](https://img.shields.io/npm/v/bundle-phobia-cli.svg)](https://www.npmjs.com/package/bundle-phobia-cli)
[![Build Status](https://github.com/AdrieanKhisbe/bundle-phobia-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/AdrieanKhisbe/bundle-phobia-cli/actions)
[![codecov](https://codecov.io/gh/AdrieanKhisbe/bundle-phobia-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/AdrieanKhisbe/bundle-phobia-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> Cli for the node [BundlePhobia](https://bundlephobia.com/) Service

## About

[BundlePhobia](https://bundlephobia.com/) is a tool to help you _find the cost of adding a npm package to your bundle_.
It enables you to query package sizes.

## Installation

Just use `npm install -g bundle-phobia-cli` and you're good to go!

## Usage

Once installed you will have access a single executable `bundle-phobia` (aliased to `bundle-phobia-cli` for `npx usage`), with two commands: 
- `stats` to query package size. This is the default command, just invoke it with a list of package names and some options.
   ```
    $ bundle-phobia lodash react
   ```
- `install`: to conditionally install package if weight constraint are respected. This is a wrapper on `npm install`
   ```
    $ bundle-phobia install lodash react
   ```

Note that you can specify a version along with the package range such as an
instance exact version `lodash@4.12.0` or range version `ora@^3.0.0`.

### Examples
```bash
# Query package size of lodash and react
$ bundle-phobia lodash react
ℹ lodash (4.17.11) has 0 dependencies for a weight of 68.51KB (24.05KB gzipped)
ℹ react (16.6.0) has 4 dependencies for a weight of 5.86KB (2.48KB gzipped)

# Perform conditional install of lodash
$ bundle-phobia-install lodash
ℹ Applying a size limit of 100KB
ℹ Proceed to installation of package lodash
+ lodash@4.17.11
added 1 package from 2 contributors and audited 1 package in 1.377s
found 0 vulnerabilities
```


### Detailed Usage
#### `bundle-phobia`

Some option are available to control what stats are outputed by `bundle-phobia`.

By default an humain friendly output is provided, otherwise you can have a json output
with the `--json` flag. In case you need just the size (or gzip) in a script, you can
use the `--[gzip]-size` flag.

To control the packages to be queried, you can either provide them as an argument list,
or you can refer a `package.json` file with the `--package` option. This would read the
packages as `dependencies`.
You can also provide a folder to `-p` (including `.`). This would look for `package.json` in that folder.

##### Options Summary
```
Usage: bundle-phobia <package-name> [other-package-names...]

Options:
  --version           Show version number                              [boolean]
  -p, --package       Provide a package.json to read dependencies       [string]
  -r, --range         Get a range of version (0 for all, 8 by default)  [number]
  -j, --json          Output json rather than a formater string        [boolean]
  -s, --size          Output just the module size                      [boolean]
  -g, --gzip-size     Output just the module gzip size                 [boolean]
  -d, --dependencies  Output just the number of dependencies           [boolean]
  -x, --fail-fast     Stop on first error                              [boolean]
  -1, --serial        Run requests serially                            [boolean]
      --self          Output bundle-phobia stats                       [boolean]
  -h, --help          Show help                                        [boolean]
```
#### `bundle-phobia install`

`bundle-phobia install` offer three kind of flags:
- flags to specify the size constraints
- flags to specify behavior when constraints are not respected
- npm install flags to control it's behavior

To control the size constraint of a single package: `--max-size` and `--max-gzip-size` aliases to `-m` and `-M`.
To control the overall size of dependencies: `--max-overall-size` and `--max-overall-gzip-size` aliases to `-o` and `-O`.
They expect a size argument that can be either a number or a number followed by a `kB`, `mB` unit.

By default if constraint is not respected, install with failed.
If you want to perform anyway with just a warning use the `--warn`/`-w` flag.
If you want to be asked what to do, use the `--interactive`/`-i`.

All other options will be conveyed to `npm`.

Limits can also be configured in the `package.json` by adding a `bundle-phobia` section with a `max-[gzip-]size` key.
```json
{
  "name": "bundle-phobia-install-test",
  "dependencies": {},
  "bundle-phobia": {
    "max-size": "12kB",
    "max-overall-size": "1MB"
  }
}
```

##### Options Summary

```
Usage: bundle-phobia-install <package-name> [other-package-names...]

Options:
  --version            Show version number                             [boolean]
  -w, --warn           Install despite of negative check but warn about
                       predicate violation                             [boolean]
  -i, --interactive    Ask for override in case of predicate violation [boolean]
  -m, --max-size       Size threeshold of individual library to install [string]
  -M, --max-gzip-size  Gzip Size threeshold of individual library to install
                                                                        [string]
  -o, --max-overall-size       Overall size threeshold of dependencies  [string]
  -O, --max-overall-gzip-size  Overall Gzip size threeshold of dependencies
                                                                        [string]
  -x, --fail-fast              Stop on first error                     [boolean]
  -h, --help           Show help                                       [boolean]
```
