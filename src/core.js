import c from 'chalk';
import _ from 'lodash/fp.js';
import ora from 'ora';
import pMap from 'p-map';
import {
  fetchPackageStats,
  getPackageVersionList,
  getPackagesFromPackageJson
} from './fetch-package-stats.js';
import {getView} from './cli-views.js';
import fakeSpinner from './fake-spinner.js';

const getPackages = async argv => {
  const range = argv.range || (argv.range === undefined ? null : -1);
  if ('range' in argv && 'r' in argv) return getPackageVersionList(argv.packages[0], range || 8);
  if (argv.self) return ['bundle-phobia-cli'];
  if (('package' in argv && 'p' in argv) || _.isEmpty(argv.packages))
    return getPackagesFromPackageJson(argv.package || '.'); // !FIXME: this adress 56, implicit default folder

  return argv.packages;
};

const isSingleOutput = argv =>
  _.some(opt => opt in argv, ['size', 'json', 'gzip-size', 'dependencies']);

const shouldStopOnError = (packages, argv) => _.size(packages) <= 1 || argv['fail-fast'] || false;

const main = async ({argv, stream = process.stdout}) => {
  if ('range' in argv && 'r' in argv && argv.packages.length > 1)
    throw new Error("Can't use both --range option and list of packages");

  if ('package' in argv && 'p' in argv && !_.isEmpty(argv.packages))
    throw new Error("Can't use both --package option and list of packages");

  if ('self' in argv && !_.isEmpty(argv.packages))
    throw new Error("Can't use both --self and list of packages");

  const spinnerActivated = !isSingleOutput(argv);
  const Spinner = spinnerActivated ? ora : fakeSpinner;
  const spinner = Spinner({stream});

  const packages = await getPackages(argv).catch(err => {
    // !FIXME: check the error handling message?
    const paquage = argv.packages[0] || `packages from ${argv.package || 'package.json'}`;
    /*
    if (spinnerActivated)
      spinner.fail(c.red(`resolving ${c.bold.underline(paquage)} failed: `) + err.message);
    */
    const wrapError = new Error(`${paquage}: ${err.message}`); // FIXME: reword
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
    // p-map v7+ wraps multiple errors in AggregateError, unwrap the first one
    if (err instanceof AggregateError && err.errors?.length > 0) {
      throw err.errors[0];
    }
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

export {main, isSingleOutput};
