#!/usr/bin/env node

const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

const c = require('chalk')
const Bromise = require('bluebird');
const _ = require('lodash');
const ora = require('ora');
const {fetchPackageStats, getPackageVersionList} = require('./src/fetch-package-stats');
const {getView} = require('./src/cli-views');
const fakeSpinner = require('./src/fake-spinner')

const argv = require('yargs')
    .usage('Usage: $0 <package-names...>')
    .describe('range', 'Get a range of version (0 for all, 8 by default)').alias('range', 'r').number('range')
    .describe('json', 'Output json rather than a formater string').alias('json', 'j').boolean('j')
    .describe('size', 'Output just the module size').alias('size', 's').boolean('s')
    .describe('gzip-size', 'Output just the module gzip size').alias('gzip-size', 'g').boolean('g')
    .describe('dependencies', 'Output just the number of dependencies').alias('dependencies', 'd').boolean('d')
    .help('h').alias('h', 'help')
    .argv;

const isSingleOutput = argv => _.some(['size', 'json', 'gzip-size', 'dependencies'], opt => opt in argv);

const main = argv => {
    if(('range' in argv && 'r' in argv) && argv._.length > 1) {
        return Bromise.reject(new Error("Can't use both --range option and list of packages"));
    }
    const noSpin = isSingleOutput(argv);
    const Spinner = noSpin ? fakeSpinner : ora;
    const spinner = Spinner(`Fetching stats for package${argv._.length > 1 ? 's list': ''}`).start()
    const range = argv.range ? argv.range : (argv.range === undefined ? null : 'all')
    const packages = ('range' in argv && 'r' in argv)
      ? getPackageVersionList(argv._[0], range || 8)
      : Bromise.resolve(argv._);
    const view = getView(argv);

    return packages
      .each(paquage =>
        fetchPackageStats(paquage)
          .then(stats => {
            spinner.info(view(stats)).start()
          })
          .catch(err => {
              if(noSpin) {
                  const wrapError = new Error(`${paquage}: ${err.message}`)
                  wrapError.error = err;
                  throw wrapError;
              }
              spinner.fail(c.red(`resolving ${c.bold.underline(paquage)} failed: `) + err.message)
          }))
      .finally(() => spinner.stop())
}

module.exports = {main, isSingleOutput};

if (!module.parent) {
    main(argv).catch(err => {
        console.log(c.red(err.message))
        process.exit(1);
    })
    updateNotifier({pkg}).notify();
}
