#!/usr/bin/env node

const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

const c = require('chalk')
const Bromise = require('bluebird');
const ora = require('ora');
const {fetchPackageStats, getPackageVersionList} = require('./lib/fetch-package-stats');
const {getView} = require('./lib/cli-views');

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
    const spinner = ora(`Fetching stats for package${argv._.length > 1 ? 's': ''}: ${
        argv._.map(package =>
        c.dim.bold(package)).join(', ')
    }`).start()
    const packages = ('range' in argv && 'r' in argv)
      ? getPackageVersionList(argv._[0], argv.range ? argv.range : (argv.range === undefined ? 8 : 'all'))
      : Bromise.resolve(argv._);

    packages
      .map(fetchPackageStats)
      .map(stats => {
        spinner.info(view(stats))
       })
      .finally(() => spinner.stop())

        // `Fetching stats for ${c.cyan(nversion)} last versions of package ${c.dim.underline(package)}`,
    // fetchAndPresent(
    //     `Fetching stats for package ${c.dim.underline(package)}`,
    //     fetchPackageStats(package),
    //     packageState => console.log(view(packageState))
    // );
}

module.exports.main = main;

if (!module.parent) {
    main(argv)
    updateNotifier({pkg}).notify();
}
