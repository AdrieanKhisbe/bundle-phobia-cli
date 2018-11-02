const c = require('chalk');
const Bromise = require('bluebird');
const _ = require('lodash');
const ora = require('ora');
const shelljs = require('shelljs');
const {fetchPackageStats} = require('./fetch-package-stats');
const fakeSpinner = require('./fake-spinner');

const main = ({argv, stream = process.stdout, noOra = false}) => {
  if ('range' in argv && 'r' in argv && argv._.length > 1) {
    return Bromise.reject(new Error("Can't use both --range option and list of packages"));
  }
  const noSpin = noOra;
  const Spinner = noSpin ? fakeSpinner : ora;
  const spinner = Spinner({stream});

  const handleError = (paquage, forceThrow) => err => {
    if (!noSpin)
      spinner.fail(c.red(`resolving ${c.bold.underline(paquage)} failed: `) + err.message);
    if (forceThrow || noSpin) {
      const wrapError = new Error(`${paquage}: ${err.message}`);
      wrapError.error = err;
      throw wrapError;
    }
  };

  const packages = Bromise.resolve(argv._);

  return packages
    .each(paquage => {
      spinner.text = `Fetching stats for package ${c.dim.bold(paquage)}`;
      spinner.start();
      return fetchPackageStats(paquage)
        .then(stats => {
          // PREDICATE HERE
          return {canInstall: false, reason: 'NO GO'};
        })
        .catch(handleError(paquage));
    })
    .then(statuses => {
      spinner.clear();
      if (_.every(statuses, {canInstall: true})) {
        shelljs.exec('echo yo npm install');
      } else {
        console.log('could not install');
      }
      return;
    })
    .finally(() => spinner.stop());
};

module.exports = {main};
