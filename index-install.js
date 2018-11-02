#!/usr/bin/env node

const updateNotifier = require('update-notifier');
const c = require('chalk');
const argv = require('yargs')
  .usage('Usage: $0 <package-names...>')
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
