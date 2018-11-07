#!/usr/bin/env node

const updateNotifier = require('update-notifier');
const c = require('chalk');
const argv = require('yargs')
  .usage('Usage: $0  <package-name> [other-package-names...]')
  .describe('range', 'Get a range of version (0 for all, 8 by default)')
  .alias('range', 'r')
  .number('range')
  .describe('json', 'Output json rather than a formater string')
  .alias('json', 'j')
  .boolean('j')
  .describe('size', 'Output just the module size')
  .alias('size', 's')
  .boolean('s')
  .describe('gzip-size', 'Output just the module gzip size')
  .alias('gzip-size', 'g')
  .boolean('g')
  .describe('dependencies', 'Output just the number of dependencies')
  .alias('dependencies', 'd')
  .boolean('d')
  .describe('self', 'Output bundle-phobia stats')
  .boolean('self')
  .help('h')
  .alias('h', 'help').argv;
const pkg = require('./package.json');

const {main} = require('./src/core');

if (!module.parent) {
  /* eslint-disable no-console */
  main({argv}).catch(err => {
    console.log(c.red.bold('bundle-phobia failed: ') + err.message);
    process.exit(1);
  });
  updateNotifier({pkg}).notify();
}
