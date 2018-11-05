#!/usr/bin/env node

const updateNotifier = require('update-notifier');
const c = require('chalk');
const argv = require('yargs')
  .usage('Usage: $0  <package-name> [other-package-names...]')
  .describe('warn', 'Install despite of negative check but warn about predicate violation')
  .alias('warn', 'w')
  .boolean('warn') // no force, use npm instead ;)
  .describe('interactive', 'Ask for override in case of predicate violation')
  .alias('interactive', 'i')
  .boolean('interactive')
  .describe('max-size', 'Size threeshold of individual library to install')
  .alias('max-size', 'm')
  .string('max-size')
  .describe('max-gzip-size', 'Gzip Size threeshold of individual library to install')
  .alias('max-gzip-size', 'M')
  .string('max-gzip-size')
  // List of npm install flags
  .boolean([
    's',
    'S',
    'save',
    'P',
    'save-prod',
    'D',
    'save-dev',
    'O',
    'save-optional',
    'E',
    'save-exact',
    '-B',
    'save-bundle',
    'no-save',
    'dry-run'
  ])
  .help('h')
  .alias('h', 'help').argv;
const pkg = require('./package.json');

const {main} = require('./src/install');

if (!module.parent) {
  /* eslint-disable no-console */
  main({argv}).catch(err => {
    console.log(c.red.bold('bundle-phobia-install failed: ') + err.message);
    process.exit(1);
  });
  updateNotifier({pkg}).notify();
}
