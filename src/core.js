const c = require('chalk');
const Bromise = require('bluebird');
const _ = require('lodash');
const ora = require('ora');
const {fetchPackageStats, getPackageVersionList} = require('./fetch-package-stats');
const {getView} = require('./cli-views');
const fakeSpinner = require('./fake-spinner');

const isSingleOutput = argv =>
  _.some(['size', 'json', 'gzip-size', 'dependencies'], opt => opt in argv);

const main = ({argv, stream = process.stdout}) => {
  if ('range' in argv && 'r' in argv && argv._.length > 1) {
    return Bromise.reject(new Error("Can't use both --range option and list of packages"));
  }
  const noSpin = isSingleOutput(argv);
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

  const range = argv.range || (argv.range === undefined ? null : -1);
  const packages =
    'range' in argv && 'r' in argv
      ? getPackageVersionList(argv._[0], range || 8).catch(handleError(argv._[0], true))
      : Bromise.resolve(argv._);
  const view = getView(argv);

  return packages
    .each(paquage => {
      spinner.text = `Fetching stats for package ${c.dim.bold(paquage)}`;
      spinner.start();
      return fetchPackageStats(paquage)
        .then(stats => {
          spinner.info(view(stats));
          return stats;
        })
        .catch(handleError(paquage));
    })
    .finally(() => spinner.stop());
};

module.exports = {main, isSingleOutput};
