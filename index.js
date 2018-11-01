#!/usr/bin/env node

const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

const c = require('chalk')
const ora = require('ora');
const {fetchPackageStats, fetchPackageStatsByVersion} = require('./lib/fetch-package-stats');
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

if (!module.parent) {
    const package = argv._[0];

    const fetchAndPresent = (computeMessage, fetchPromise, processFunction) => {
        const spinner = ora(computeMessage).start()
        return fetchPromise
            .finally(() => spinner.stop().clear())
            .then(processFunction)
            .catch(err => console.error(c.red.bold('Error happened:'), err.message));
    }
    const view = getView(argv);

    if ('range' in argv && 'r' in argv) {
        const nversion = argv.range ? argv.range : (argv.range === undefined ? 8 : 'all');
        fetchAndPresent(
            `Fetching stats for ${c.cyan(nversion)} last versions of package ${c.dim.underline(package)}`,
            fetchPackageStatsByVersion(package, argv.range),
            packageStates => packageStates.map(packageState => console.log(view(packageState)))
        );
    } else {
        fetchAndPresent(
            `Fetching stats for package ${c.dim.underline(package)}`,
            fetchPackageStats(package),
            packageState => console.log(view(packageState))
        );
    }
    updateNotifier({pkg}).notify();
}
