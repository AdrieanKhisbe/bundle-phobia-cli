#!/usr/bin/env node

const updateNotifier = require('update-notifier');
const c = require('chalk');
const Yargs = require('yargs');
const yargs = require('yargs');

const STATS_OPTIONS = {
  package: {
    alias: 'p',
    string: true,
    describe: 'Provide a package.json to read dependencies'
  },
  range: {
    alias: 'r',
    number: true,
    describe: 'Get a range of version (0 for all, 8 by default)'
  },
  json: {
    alias: 'j',
    boolean: true,
    describe: 'Output json rather than a formater string'
  },
  size: {
    alias: 's',
    boolean: true,
    describe: 'Output just the module size'
  },
  'gzip-size': {
    alias: 'g',
    boolean: true,
    describe: 'Output just the module gzip size'
  },
  dependencies: {
    alias: 'd',
    boolean: true,
    describe: 'Output just the number of dependencies'
  },
  'fail-fast': {
    alias: 'x',
    boolean: true,
    default: false,
    describe: 'Stop on first error'
  },
  serial: {
    alias: '1',
    boolean: true,
    describe: 'Run requests serially'
  },
  self: {
    boolean: true,
    describe: 'Output bundle-phobia stats'
  },
  help: {
    alias: 'h',
    describe: 'Show help'
  }
};
const INSTALL_OPTIONS = {
  warn: {
    describe: 'Install despite of negative check but warn about predicate violation',
    alias: 'w',
    boolean: true
  },
  interactive: {
    describe: 'Ask for override in case of predicate violation',
    alias: 'i',
    boolean: true
  },
  'max-size': {
    describe: 'Size threeshold of individual library to install',
    alias: 'm',
    string: true
  },
  'max-gzip-size': {
    describe: 'Gzip Size threeshold of individual library to install',
    alias: 'M',
    string: true
  },
  'max-overall-size': {
    describe: 'Overall size threeshold of dependencies',
    alias: 'o',
    string: true
  },
  'max-overall-gzip-size': {
    describe: 'Overall Gzip size threeshold of dependencies',
    alias: 'O',
    string: true
  },
  'fail-fast': {
    describe: 'Stop on first error',
    alias: 'x',
    boolean: true
  }
};

const yargsParser = Yargs.scriptName('bundle-phobia')
  .parserConfiguration({
    'short-option-groups': true,
    'camel-case-expansion': false,
    'dot-notation': false,
    'parse-numbers': true,
    'boolean-negation': false
  })
  .usage('Bundle Phobia: Find the cost of adding a npm package to your bundle')
  .example('$0 lodash chalk', 'Get stats for a list of packages')
  .example('$0 install lodash chalk', 'Conditionaly install packages')
  .command(
    'install',
    'Perform install if specified size constraints are met',
    yargs => yargs.options(INSTALL_OPTIONS),
    argv =>
      require('./src/install')
        .main({argv})
        .catch(err => {
          console.log(c.red.bold(`bundle-phobia-install failed: `) + err.message);
          yargs.exit(1, err);
        })
  )
  .command(
    ['$0', 'stats', 'package-stats'],
    'Get the stats of given package from bundlephobia.com',
    yargs => yargs.options(STATS_OPTIONS),
    argv =>
      require('./src/core')
        .main({argv})
        .catch(err => {
          console.log(c.red.bold(`bundle-phobia failed: `) + err.message);
          yargs.exit(1, err);
        })
  )
  .showHelpOnFail(false)
  .alias('h', 'help')
  .pkgConf('bundle-phobia');

if (!module.parent) {
  yargsParser.parse(process.argv.slice(2)).argv;
  const pkg = require('./package');
  updateNotifier({pkg}).notify();
}
