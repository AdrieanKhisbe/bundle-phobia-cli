# bundle-phobia-cli

[![npm](https://img.shields.io/npm/v/bundle-phobia-cli.svg)](https://www.npmjs.com/package/bundle-phobia-cli)
[![Build Status](https://travis-ci.org/AdrieanKhisbe/bundle-phobia-cli.svg?branch=master)](https://travis-ci.org/AdrieanKhisbe/bundle-phobia-cli)
[![codecov](https://codecov.io/gh/AdrieanKhisbe/bundle-phobia-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/AdrieanKhisbe/bundle-phobia-cli)

> Cli for the node [BundlePhobia](https://bundlephobia.com/) Service

## About

[BundlePhobia](https://bundlephobia.com/) is a tool to help you _find the cost of adding a npm package to your bundle_.
It enables you to query package sizes.

## Installation

Just use `npm install -g bundle-phobia-cli` and you're good to go!

## Usage

For now, just `bundle-phobia <package-name>` and you will get its stats.
You can also query a list of packages, or precise the package version you want to query.
For instance exact version `lodash@4.12.0` or range version `ora@^3.0.0`.

### Detailed Usage

```
Usage: bundle-phobia <package-name>

Options:
  --range, -r         Get a range of version (0 for all, 8 by default)  [number]
  --json, -j          Output json rather than a formater string        [boolean]
  --size, -s          Output just the module size                      [boolean]
  --gzip-size, -g     Output just the module gzip size                 [boolean]
  --dependencies, -d  Output just thenumber of dependencies            [boolean]
  -h, --help          Show help                                        [boolean]

```
