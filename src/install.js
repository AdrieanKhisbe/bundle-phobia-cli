const c = require('chalk');
const Bromise = require('bluebird');
const _ = require('lodash');
const ora = require('ora');
const shelljs = require('shelljs');
const inquirer = require('inquirer');
const {fetchPackageStats} = require('./fetch-package-stats');
const fakeSpinner = require('./fake-spinner');

const npmOptionsFromArgv = argv => {
  const output = _.reduce(
    _.omit(argv, ['i', 'interactive', '$0', 'warn', 'w', '_']),
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

const main = ({
  argv,
  stream = process.stdout,
  noOra = false,
  exec = shelljs.exec,
  prompt = inquirer.prompt
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
  const packages = argv._;
  const pluralSuffix = packages.lenght > 1 ? 's' : '';

  const performInstall = () => {
    return exec(installCommand(argv));
  };

  spinner.text = `Fetching stats for package${pluralSuffix} ${packages}`;
  spinner.start();
  return Bromise.map(packages, paquage => {
    return fetchPackageStats(paquage)
      .then(stats => {
        // PREDICATE HERE
        const THRESOLD = 10000;
        if (stats.size > THRESOLD)
          return {
            package: paquage,
            canInstall: false,
            reason: 'size over threshold',
            details: `${stats.size} > ${THRESOLD}`
          };
        return {package: paquage, canInstall: true};
      })
      .catch(handleError(paquage, true));
  })
    .then(statuses => {
      spinner.clear();
      if (_.every(statuses, {canInstall: true})) {
        spinner.info(
          `Proceed to installation of package${pluralSuffix} ${c.bold.dim(packages.join(', '))}`
        );
        return performInstall();
        // §TODO: handle failure exit. and eventually add status message .succeed
      } else if (argv.warn) {
        spinner.info(
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
        return performInstall();
      } else if (argv.interactive) {
        spinner.info(
          `Packages ${packages.map(p => c.bold.dim(p)).join(', ')} raised following warnings:`
        );
        _.forEach(_.filter(statuses, {canInstall: false}), status => {
          spinner.warn(
            `${c.red.yellow(status.package)}: ${status.reason}${
              status.details ? ` (${c.dim(status.details)})` : ''
            }`
          );
        });
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
        spinner.info('Could not install for following reasons:');
        _.forEach(statuses, status => {
          if (status.canInstall)
            spinner.succeed(`${c.green.bold(status.package)}: was ok to install`);
          else
            spinner.fail(
              `${c.red.bold(status.package)}: ${status.reason}${
                status.details ? ` (${c.dim(status.details)})` : ''
              }`
            );
        });
        throw new Error('Install was canceled.');
      }
    })
    .finally(() => spinner.stop());
};

module.exports = {main, npmOptionsFromArgv, installCommand};
