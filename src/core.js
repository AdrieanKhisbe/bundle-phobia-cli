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
  if ('self' in argv && argv._.length > 0) {
    return Bromise.reject(new Error("Can't use both --self and list of packages"));
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
      : Bromise.resolve(argv.self ? ['bundle-phobia-cli'] : argv._);
  let view;
  try {
    view = getView(argv);
  } catch (err) {
    return Bromise.reject(err);
  }

  return Bromise.mapSeries(packages, paquage => {
    spinner.text = `Fetching stats for package ${c.dim.bold(paquage)}`;
    spinner.start();
    return fetchPackageStats(paquage)
      .then(stats => {
        spinner.info(view(stats));
        return stats;
      })
      .catch(handleError(paquage));
  })
    .tap(allStats => {
      const nLibs = _.size(allStats);
      if (nLibs > 1) {
        spinner.clear();
        stream.write('\n');
        const dependencyCount = _.sumBy(allStats, 'dependencyCount');
        const gzip = _.sumBy(allStats, 'gzip');
        const size = _.sumBy(allStats, 'size');
        spinner.info(
          view({
            name: c.magenta('total'),
            version: `${nLibs} packages`,
            gzip,
            size,
            dependencyCount
          })
        );
      }
    })
    .finally(() => spinner.stop());
};

module.exports = {main, isSingleOutput};
