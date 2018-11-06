const c = require('chalk');
const Bromise = require('bluebird');
const _ = require('lodash');
const ora = require('ora');
const shelljs = require('shelljs');
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

const npmOptionsFromArgv = argv => {
  const output = _.reduce(
    _.omit(argv, [
      'i',
      'interactive',
      '$0',
      'warn',
      'w',
      '_',
      'm',
      'M',
      'max-size',
      'max-gzip-size'
    ]),
    (memo, value, key) => {
      const val = _.isBoolean(value) ? '' : ` ${value}`;
      return [...memo, (_.size(key) === 1 ? '-' : '--') + key + val];
    },
    []
  );
  return output.join(' ');
};

const installCommand = argv => {
  const options = npmOptionsFromArgv(argv);
  return `npm install ${argv._.join(' ')}${(options && ` ${options}`) || ''}`;
};

const getSizePredicate = (argv, defaultSize, packageConfig) => {
  if (argv['max-size']) return sizePredicate(argv['max-size'], 'argv');
  if (argv['max-gzip-size']) return gzipSizePredicate(argv['max-gzip-size'], 'argv');

  const maxSizeConfig = _.get(packageConfig, ['bundle-phobia', 'max-size']);
  if (maxSizeConfig) return sizePredicate(maxSizeConfig, 'package-config');
  const maxGzipSizeConfig = _.get(packageConfig, ['bundle-phobia', 'max-gzip-size']);
  if (maxGzipSizeConfig) return gzipSizePredicate(maxGzipSizeConfig, 'package-config');

  return sizePredicate(defaultSize, 'default');
};
const getGlobalSizePredicate = (argv, packageConfig) => {
  if (argv['max-global-size']) return globalSizePredicate(argv['max-global-size'], 'argv');
  if (argv['max-global-gzip-size'])
    return globalGzipSizePredicate(argv['max-global-gzip-size'], 'argv');

  const maxGlobalSizeConfig = _.get(packageConfig, ['bundle-phobia', 'max-global-size']);
  if (maxGlobalSizeConfig) return globalSizePredicate(maxGlobalSizeConfig, 'package-config');
  const maxGlobalGzipSizeConfig = _.get(packageConfig, ['bundle-phobia', 'max-global-gzip-size']);
  if (maxGlobalGzipSizeConfig) return globalGzipSizePredicate(maxGlobalGzipSizeConfig, 'package-config');

  return () => ({canInstall: true});
};

const main = ({
  argv,
  stream = process.stdout,
  noOra = false,
  exec = shelljs.exec,
  prompt = inquirer.prompt,
  defaultMaxSize = DEFAULT_MAX_SIZE,
  readPkg = () => _.get(readPkgUp.sync(), 'pkg')
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
  if (_.isEmpty(packages)) return Bromise.reject(new Error('No packages to install was given'));
  const pluralSuffix = _.size(packages) > 1 ? 's' : '';

  const performInstall = () => {
    const res = exec(installCommand(argv));
    if (res.code !== 0) throw new Error(`npm install returned with status code ${res.code}`);
  };
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
  return Bromise.map(packages, paquage => {
    return fetchPackageStats(paquage)
      .then(stats => {
        const status = predicate(stats);
        status.package = paquage;
        return _.assign({}, status, stats);
      })
      .catch(handleError(paquage, true));
  })
    .then(statuses => {
      const aggregateStats = statsList => {
        const dependencyCount = _.sumBy(statsList, 'dependencyCount');
        const gzip = _.sumBy(statsList, 'gzip');
        const size = _.sumBy(statsList, 'size');
        return {size, gzip, dependencyCount};
      };
      const toInstallStats = aggregateStats(statuses);

      spinner.text = 'Fetching stats for already installed packages';
      spinner.color = 'blue';
      // eslint-disable-next-line promise/no-nesting
      return fetchPackageJsonStats(currentPkg).then(allStats => {
        const installedStats = aggregateStats(allStats);
        const globalStatus = globalPredicate(installedStats, toInstallStats);
        return {statuses, globalStatus};
      });
    })
    .then(({statuses, globalStatus}) => {
      spinner.clear();
      if (globalStatus.canInstall && _.every(statuses, {canInstall: true})) {
        spinner.info(
          `Proceed to installation of package${pluralSuffix} ${c.bold.dim(packages.join(', '))}`
        );
        return performInstall();
        // §TODO: handle failure exit. and eventually add status message .succeed
      } else if (argv.warn) {
        spinner.warn(
          `Proceed to installation of packages ${packages
            .map(p => c.bold.dim(p))
            .join(', ')} despite following warnings:`
        );

        _.forEach(_.filter(statuses, {canInstall: false}), status => {
          spinner.warn(
            `${c.red.yellow(status.package)}: ${status.reason}${
              status.details ? ` (${c.dim(status.details)})` : ''
            }`
          );
        });
        if (!globalStatus.canInstall)
          spinner.warn(
            `${c.yellow.bold('global constraint')} is not respected: ${
              globalStatus.reason
            } (${c.dim(globalStatus.details)})`
          );
        return performInstall();
      } else if (argv.interactive) {
        spinner.warn(
          `Packages ${packages.map(p => c.bold.dim(p)).join(', ')} raised following ${c.yellow.bold(
            'warnings'
          )}:`
        );

        _.forEach(_.filter(statuses, {canInstall: false}), status => {
          spinner.warn(
            `${c.red.yellow(status.package)}: ${status.reason}${
              status.details ? ` (${c.dim(status.details)})` : ''
            }`
          );
        });
        if (!globalStatus.canInstall)
          spinner.warn(
            `${c.yellow.bold('global constraint')} is not respected: ${
              globalStatus.reason
            } (${c.dim(globalStatus.details)})`
          );
        // eslint-disable-next-line promise/no-nesting
        return prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: 'Do you still want to proceed with installation?',
            default: 'N'
          }
        ]).then(answer => {
          if (answer.proceed) {
            spinner.succeed('Proceeding with installation as you requested');
            return performInstall();
          } else {
            return spinner.fail('Installation is canceled on your demand');
          }
        });
      } else {
        spinner.fail(c.bold('Could not install for following reasons:'));
        _.forEach(statuses, status => {
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
        });
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
    })
    .finally(() => spinner.stop());
};

module.exports = {
  main,
  npmOptionsFromArgv,
  installCommand,
  getGlobalSizePredicate,
  getSizePredicate
};
