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

    let computeMessage, fetchPromise, processFunction;

    if ('range' in argv && 'r' in argv) {
        const nversion = argv.range ? argv.range : (argv.range === undefined ? 8 : 'all');
        computeMessage = `Fetching stats for ${c.cyan(nversion)} versions of package ${c.dim.underline(package)}`;
        fetchPromise = fetchPackageStatsByVersion(package, argv.range)
        processFunction = packageStates => packageStates.map(packageState => console.log(syntheticView(packageState)));
    } else {
        computeMessage = `Fetching stats for package ${c.dim.underline(package)}`
        fetchPromise = fetchPackageStats(package)
        processFunction = packageState => console.log(syntheticView(packageState));
    }
    const spinner = ora(computeMessage).start()
    fetchPromise
        .finally(() => spinner.stop().clear())
        .then(processFunction)
        .catch(err => console.error(c.red.bold('Error happened:'), err.message));
}
