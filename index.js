#!/usr/bin/env node

const c = require('chalk')
const ora = require('ora');
const {fetchPackageStats, fetchPackageStatsByVersion} = require('./lib/fetch-package-stats');
const {syntheticView} = require('./lib/cli-views');

if (!module.parent) {
    const package = process.argv[2];
    const spinner = ora(`Fetching stats for package ${c.dim.underline(package)}`).start()
    fetchPackageStats(package)
        .finally(() => spinner.stop().clear())
        .then(packageState => {
            console.log(syntheticView(packageState));
        })
        .catch(err => console.error(c.red.bold('Error happened:'), err.message));
}
