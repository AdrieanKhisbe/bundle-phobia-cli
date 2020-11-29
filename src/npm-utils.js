const {execFile} = require('child_process');
const {resolver} = require('resolve-package-json');
const _ = require('lodash/fp');

const getVersionList = name => {
  if (!name) return Promise.reject(new Error('Empty name given as argument'));
  return new Promise((resolve, reject) =>
    execFile(getNpmCommand( ), ['show', name, 'versions', '--json'], (err, stdout, stderr) => {
      if (err) {
        return reject(
          /Registry returned 404 for GET on|404 Not found|code E404/.test(stderr)
            ? new Error("The package you were looking for doesn't exist.")
            : err
        );
      }
      return resolve(JSON.parse(stdout));
    })
  );
};

const getNpmCommand = () => /^win/.test(process.platform) ? 'npm.cmd' : 'npm';

const shouldResolve = pkg => /.*@([\^~]|.*x)/.test(pkg);

const resolveVersionRange = async pkg => {
  // unfortunately no named capture groups in Node 6..
  const match = pkg.match(/^(@?[^@]+)(?:@(.*?))?$/);
  if (!match) throw new Error(`Unable to parse package name ${pkg}`);
  const packageName = match[1];
  const version = match[2];
  if (!shouldResolve(pkg)) {
    await getVersionList(packageName);
    return pkg;
  }
  return new Promise((resolve, reject) => {
    resolver({[packageName]: version}, function (err, result) {
      /* istanbul ignore if*/
      if (err) return reject(err);
      if (!_.has(['dependencies', packageName], result))
        return reject(new Error(`Specified version range '${version}' is not resolvable`));
      return resolve(`${packageName}@${result.dependencies[packageName].version}`);
    });
  });
};

const getDependencyList = _.pipe(
  _.getOr({}, 'dependencies'),
  _.toPairs,
  _.map(([key, value]) => `${key}@${value}`)
);

module.exports = {getVersionList, shouldResolve, resolveVersionRange, getDependencyList};
