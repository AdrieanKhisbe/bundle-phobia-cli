#!/usr/bin/env node

const c = require('chalk')
const ora = require('ora');
const {fetchPackageStats, fetchPackageStatsByVersion} = require('./lib/fetch-package-stats');
const {syntheticView} = require('./lib/cli-views');

const argv = require('yargs')
    .usage('Usage: $0 <package-name>')
    .describe('range', 'specify a range of version you want').alias('range', 'r').number('range')
    .help('h').alias('h', 'help')
    .argv;

if (!module.parent) {
    const package = argv._[0];

    if ('range' in argv && 'r' in argv) {
        const nversion = argv.range ? argv.range : (argv.range === undefined ? 8 : 'all');
        const spinner = ora(`Fetching stats for ${c.cyan(nversion)} versions of package ${c.dim.underline(package)}`).start()
        fetchPackageStatsByVersion(package, argv.range)
            .finally(() => spinner.stop().clear())
            .map(packageState => {
                console.log(syntheticView(packageState));
            })
            .catch(err => console.error(c.red.bold('Error happened:'), err.message));
    } else {
        const spinner = ora(`Fetching stats for package ${c.dim.underline(package)}`).start()
        fetchPackageStats(package)
            .finally(() => spinner.stop().clear())
            .then(packageState => {
                console.log(syntheticView(packageState));
            })
            .catch(err => console.error(c.red.bold('Error happened:'), err.message));
    }
}
