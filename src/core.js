const c = require('chalk');
const _ = require('lodash/fp');
const ora = require('ora');
const pMap = require('p-map');
const {
  fetchPackageStats,
  getPackageVersionList,
  getPackagesFromPackageJson
} = require('./fetch-package-stats');
const {getView} = require('./cli-views');
const fakeSpinner = require('./fake-spinner');

const getPackages = async argv => {
  const range = argv.range || (argv.range === undefined ? null : -1);
  if ('range' in argv && 'r' in argv) return getPackageVersionList(argv._[0], range || 8);
  if ('package' in argv && 'p' in argv) return getPackagesFromPackageJson(argv.package);

  return argv.self ? ['bundle-phobia-cli'] : argv._;
};

const isSingleOutput = argv =>
  _.some(opt => opt in argv, ['size', 'json', 'gzip-size', 'dependencies']);

const shouldStopOnError = (packages, argv) => _.size(packages) <= 1 || argv['fail-fast'] || false;

const main = async ({argv, stream = process.stdout}) => {
  if ('range' in argv && 'r' in argv && argv._.length > 1)
    throw new Error("Can't use both --range option and list of packages");

  if ('package' in argv && 'p' in argv && argv._.length > 0)
    throw new Error("Can't use both --package option and list of packages");

  if ('self' in argv && argv._.length > 0)
    throw new Error("Can't use both --self and list of packages");

  const spinnerActivated = !isSingleOutput(argv);
  const Spinner = spinnerActivated ? ora : fakeSpinner;
  const spinner = Spinner({stream});

  const packages = await getPackages(argv).catch(err => {
    const paquage = argv._[0] || 'packages from packages.json';
    if (spinnerActivated)
      spinner.fail(c.red(`resolving ${c.bold.underline(paquage)} failed: `) + err.message);
    const wrapError = new Error(`${paquage}: ${err.message}`);
    wrapError.error = err;
    throw wrapError;
  });
  const view = getView(argv);

  const allStats = await pMap(
    packages,
    async paquage => {
      spinner.text = `Fetching stats for package ${c.dim.bold(paquage)}`;
      spinner.start();
      const stats = await fetchPackageStats(paquage).catch(err => {
        spinner.fail(c.red(`resolving ${c.bold.underline(paquage)} failed: `) + err.message);
        throw err;
      });
      spinner.info(view(stats));
      return stats;
    },
    {concurrency: argv.serial ? 1 : undefined, stopOnError: shouldStopOnError(packages, argv)}
  ).catch(err => {
    spinner.stop();
    throw err;
  });
  const nLibs = _.size(allStats);
  if (nLibs > 1) {
    spinner.clear();
    stream.write('\n');
    spinner.info(
      view({
        name: c.magenta('total'),
        version: `${nLibs} packages`,
        gzip: _.sumBy('gzip', allStats),
        size: _.sumBy('size', allStats),
        dependencyCount: _.sumBy('dependencyCount', allStats)
      })
    );
  }

  spinner.stop();
};

module.exports = {main, isSingleOutput};
