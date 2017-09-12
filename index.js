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

    const fetchAndPresent = (computeMessage, fetchPromise, processFunction) => {
        const spinner = ora(computeMessage).start()
        return fetchPromise
            .finally(() => spinner.stop().clear())
            .then(processFunction)
            .catch(err => console.error(c.red.bold('Error happened:'), err.message));
    }

    if ('range' in argv && 'r' in argv) {
        const nversion = argv.range ? argv.range : (argv.range === undefined ? 8 : 'all');
        fetchAndPresent(
            `Fetching stats for ${c.cyan(nversion)} last versions of package ${c.dim.underline(package)}`,
            fetchPackageStatsByVersion(package, argv.range),
            packageStates => packageStates.map(packageState => console.log(syntheticView(packageState)))
        );
    } else {
        fetchAndPresent(
            `Fetching stats for package ${c.dim.underline(package)}`,
            fetchPackageStats(package),
            packageState => console.log(syntheticView(packageState))
        );
    }
}
