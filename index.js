#!/usr/bin/env node

const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

const c = require('chalk')
const Bromise = require('bluebird');
const ora = require('ora');
const {fetchPackageStats, getPackageVersionList} = require('./lib/fetch-package-stats');
const {getView} = require('./lib/cli-views');
const fakeSpinner = require('./lib/fake-spinner')

const argv = require('yargs')
    .usage('Usage: $0 <package-name>')
    .describe('range', 'Get a range of version (0 for all, 8 by default)').alias('range', 'r').number('range')
    .describe('json', 'Output json rather than a formater string').alias('json', 'j').boolean('j')
    .describe('size', 'Output just the module size').alias('size', 's').boolean('s')
    .describe('gzip-size', 'Output just the module gzip size').alias('gzip-size', 'g').boolean('g')
    .describe('dependencies', 'Output just thenumber of dependencies').alias('dependencies', 'd').boolean('d')
    .help('h').alias('h', 'help')
    .argv;

const main = argv => {;
    const fetchAndPresent = (computeMessage, fetchPromise, processFunction) => {
        
        return fetchPromise
            .finally(() => spinner.stop().clear())
            .then(processFunction)
            .catch(err => console.error(c.red.bold('Error happened:'), err.message));
    }
    const view = getView(argv);
    const Spinner = fakeSpinner;
    const spinner = Spinner(`Fetching stats for package${argv._.length > 1 ? 's list': ''}`).start()
    const packages = ('range' in argv && 'r' in argv)
      ? getPackageVersionList(argv._[0], argv.range ? argv.range : (argv.range === undefined ? 8 : 'all'))
      : Bromise.resolve(argv._);

    packages
      .each(package =>
        fetchPackageStats(package)
          .then(stats => {
            spinner.info(view(stats)).start()
          }))
      .finally(() => spinner.stop())
}

module.exports.main = main;

if (!module.parent) {
    main(argv)
    updateNotifier({pkg}).notify();
}
