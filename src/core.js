const c = require('chalk');
const Bromise = require('bluebird');
const _ = require('lodash');
const ora = require('ora');
const {fetchPackageStats, getPackageVersionList} = require('./fetch-package-stats');
const {getView} = require('./cli-views');
const fakeSpinner = require('./fake-spinner');

const isSingleOutput = argv =>
  _.some(['size', 'json', 'gzip-size', 'dependencies'], opt => opt in argv);

const main = argv => {
  if ('range' in argv && 'r' in argv && argv._.length > 1) {
    return Bromise.reject(new Error("Can't use both --range option and list of packages"));
  }
  const noSpin = isSingleOutput(argv);
  const Spinner = noSpin ? fakeSpinner : ora;
  const spinner = Spinner(`Fetching stats for package${argv._.length > 1 ? 's list' : ''}`).start();
  const range = argv.range || argv.range === undefined ? null : 'all';
  const packages =
    'range' in argv && 'r' in argv
      ? getPackageVersionList(argv._[0], range || 8)
      : Bromise.resolve(argv._);
  const view = getView(argv);

  return packages
    .each(paquage =>
      fetchPackageStats(paquage)
        .then(stats => {
          spinner.info(view(stats)).start();
          return stats;
        })
        .catch(err => {
          if (noSpin) {
            const wrapError = new Error(`${paquage}: ${err.message}`);
            wrapError.error = err;
            throw wrapError;
          }
          spinner.fail(c.red(`resolving ${c.bold.underline(paquage)} failed: `) + err.message);
        })
    )
    .finally(() => spinner.stop());
};

module.exports = {main, isSingleOutput};
