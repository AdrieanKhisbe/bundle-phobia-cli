const childProcess = require('child_process');
const {promisify} = require('util');
const c = require('chalk');
const _ = require('lodash/fp');
const ora = require('ora');
const pMap = require('p-map');
const inquirer = require('inquirer');
const readPkgUp = require('read-pkg-up');
const {fetchPackageStats, fetchPackageJsonStats} = require('./fetch-package-stats');
const fakeSpinner = require('./fake-spinner');
const {
  sizePredicate,
  gzipSizePredicate,
  globalSizePredicate,
  globalGzipSizePredicate
} = require('./install-predicates');

const DEFAULT_MAX_SIZE = '100kB';
const BUNLE_PHOBIA_ARGS = [
  'i',
  'interactive',
  '$0',
  'warn',
  'w',
  '_',
  'm',
  'M',
  'max-size',
  'max-gzip-size',
  'o',
  'O',
  'max-overall-size',
  'max-overall-gzip-size'
];
const npmOptionsFromArgv = argv => {
  return _.pipe(
    _.omit(BUNLE_PHOBIA_ARGS),
    _.toPairs,
    _.flatMap(([key, value]) => {
      const isFlag = _.isBoolean(value); // FIXME: check handling of false
      const leadingDash = _.size(key) === 1 ? '-' : '--';
      const option = leadingDash + key;
      return isFlag ? [option] : [option, value];
    })
  )(argv);
};

const installCommandArgs = argv => {
  const options = npmOptionsFromArgv(argv);
  return ['install', ...argv._, ...options];
};

const getSizePredicate = (argv, defaultSize, packageConfig) => {
  if (argv['max-size']) return sizePredicate(argv['max-size'], 'argv');
  if (argv['max-gzip-size']) return gzipSizePredicate(argv['max-gzip-size'], 'argv');

  const maxSizeConfig = _.get(['bundle-phobia', 'max-size'], packageConfig);
  if (maxSizeConfig) return sizePredicate(maxSizeConfig, 'package-config');
  const maxGzipSizeConfig = _.get(['bundle-phobia', 'max-gzip-size'], packageConfig);
  if (maxGzipSizeConfig) return gzipSizePredicate(maxGzipSizeConfig, 'package-config');

  return sizePredicate(defaultSize, 'default');
};

const getGlobalSizePredicate = (argv, packageConfig) => {
  if (argv['max-overall-size']) return globalSizePredicate(argv['max-overall-size'], 'argv');

  if (argv['max-overall-gzip-size'])
    return globalGzipSizePredicate(argv['max-overall-gzip-size'], 'argv');

  const maxGlobalSizeConfig = _.get(['bundle-phobia', 'max-overall-size'], packageConfig);
  if (maxGlobalSizeConfig) return globalSizePredicate(maxGlobalSizeConfig, 'package-config');

  const maxGlobalGzipSizeConfig = _.get(['bundle-phobia', 'max-overall-gzip-size'], packageConfig);
  if (maxGlobalGzipSizeConfig)
    return globalGzipSizePredicate(maxGlobalGzipSizeConfig, 'package-config');

  return () => ({canInstall: true});
};

const aggregateStats = statsList => ({
  size: _.sumBy('size', statsList),
  gzip: _.sumBy('gzip', statsList),
  dependencyCount: _.sumBy('dependencyCount', statsList)
});

const main = async ({
  argv,
  stream = process.stdout,
  errorStream = process.stderr,
  noOra = false,
  spawn = childProcess.spawn,
  prompt = inquirer.prompt,
  defaultMaxSize = DEFAULT_MAX_SIZE,
  readPkg = () => _.get('pkg', readPkgUp.sync())
}) => {
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
  const currentPkg = readPkg();
  const packages = argv._;
  if (_.isEmpty(packages)) throw new Error('No packages to install was given');
  const pluralSuffix = _.size(packages) > 1 ? 's' : '';

  const performInstall = () =>
    promisify(spawn)(`npm`, installCommandArgs(argv), {
      shell: true,
      stdio: [null, stream, errorStream]
    });
  const predicate = getSizePredicate(argv, defaultMaxSize, currentPkg);
  const globalPredicate = getGlobalSizePredicate(argv, currentPkg);

  spinner.text = `Fetching stats for package${pluralSuffix} ${packages.join(', ')}`;

  spinner.info(
    `Applying a ${c.underline(predicate.description)} from ${predicate.source}${
      globalPredicate.description
        ? ` and ${c.underline(globalPredicate.description)} from ${globalPredicate.source}`
        : ''
    }\n`
  );
  spinner.start();

  const statuses = await pMap(
    packages,
    async paquage => {
      const stats = await fetchPackageStats(paquage).catch(handleError(paquage, true));
      return _.defaultsAll([{package: paquage}, stats, predicate(stats)]);
    },
    {stopOnError: false}
  );

  const toInstallStats = aggregateStats(statuses);

  spinner.text = 'Fetching stats for already installed packages';
  spinner.color = 'blue';

  const allStats = await fetchPackageJsonStats(currentPkg);
  const installedStats = aggregateStats(allStats);
  const globalStatus = globalPredicate(installedStats, toInstallStats);

  spinner.clear();
  if (globalStatus.canInstall && _.every({canInstall: true}, statuses)) {
    spinner.info(
      `Proceed to installation of package${pluralSuffix} ${c.bold.dim(packages.join(', '))}`
    );
    await performInstall();
    // §TODO: handle failure exit. and eventually add status message .succeed
  } else if (argv.warn) {
    spinner.warn(
      `Proceed to installation of packages ${packages
        .map(p => c.bold.dim(p))
        .join(', ')} despite following warnings:`
    );

    _.filter({canInstall: false}, statuses).forEach(status => {
      spinner.warn(
        `${c.red.yellow(status.package)}: ${status.reason}${
          status.details ? ` (${c.dim(status.details)})` : ''
        }`
      );
    });
    if (!globalStatus.canInstall)
      spinner.warn(
        `${c.yellow.bold('global constraint')} is not respected: ${globalStatus.reason} (${c.dim(
          globalStatus.details
        )})`
      );
    await performInstall();
  } else if (argv.interactive) {
    spinner.warn(
      `Packages ${packages.map(p => c.bold.dim(p)).join(', ')} raised following ${c.yellow.bold(
        'warnings'
      )}:`
    );

    _.filter({canInstall: false}, statuses).forEach(status => {
      spinner.warn(
        `${c.red.yellow(status.package)}: ${status.reason}${
          status.details ? ` (${c.dim(status.details)})` : ''
        }`
      );
    });
    if (!globalStatus.canInstall)
      spinner.warn(
        `${c.yellow.bold('global constraint')} is not respected: ${globalStatus.reason} (${c.dim(
          globalStatus.details
        )})`
      );
    const {proceed} = await prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Do you still want to proceed with installation?',
        default: 'N'
      }
    ]);
    if (proceed) {
      spinner.succeed('Proceeding with installation as you requested');
      await performInstall();
    } else {
      spinner.fail('Installation is canceled on your demand');
    }
  } else {
    spinner.fail(c.bold('Could not install for following reasons:'));
    _.forEach(status => {
      if (status.canInstall)
        spinner.succeed(
          `${c.green.bold(status.package)}: was individually ${c.bold('ok')} to install`
        );
      else
        spinner.fail(
          `${c.red.bold(status.package)}: ${status.reason}${
            status.details ? ` (${c.dim(status.details)})` : ''
          }`
        );
    }, statuses);
    if (globalStatus.canInstall)
      spinner.succeed(`${c.green.bold('global constraint')} is respected`);
    else
      spinner.fail(
        `${c.red.bold('global constraint')} is not respected: ${globalStatus.reason} (${c.dim(
          globalStatus.details
        )})`
      );
    throw new Error('Install was canceled.');
  }

  spinner.stop();
};

module.exports = {
  main,
  npmOptionsFromArgv,
  installCommandArgs,
  getGlobalSizePredicate,
  getSizePredicate
};
