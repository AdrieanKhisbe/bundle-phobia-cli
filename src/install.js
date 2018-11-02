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
  const packages = argv._;
  spinner.text = `Fetching stats for packages ${packages}`;
  spinner.start();
  return Bromise.map(packages, paquage => {
    return fetchPackageStats(paquage)
      .then(stats => {
        // PREDICATE HERE
        // return {canInstall: false, reason: 'NO GO'};
        return {package: paquage, canInstall: true};
      })
      .catch(handleError(paquage));
  })
    .then(statuses => {
      spinner.clear();
      if (_.every(statuses, {canInstall: true})) {
        spinner.info(`Proceed to installation of packages ${c.bold.dim(packages.join(', '))}`);
        return shelljs.exec(`npm install ${packages}`); // §TODO handle options
      } else {
        spinner.info('Could not install for following reasons:');
        _.forEach(statuses, status => {
          if (status.canInstall)
            spinner.succeed(`${c.green.bold(status.package)}: was ok to install`);
          else spinner.fail(`${c.red.bold(status.package)}: ${status.reason}`);
        });
        throw new Error('Install was canceled.');
      }
    })
    .finally(() => spinner.stop());
};

module.exports = {main};
