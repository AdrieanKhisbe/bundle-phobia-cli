const {exec} = require('child_process');
const Promise = require('bluebird');
const {resolver} = require('resolve-package-json');
const _ = require('lodash');

const getVersionList = name => {
  if (!name) return Promise.reject(new Error('Empty name given as argument'));
  return Promise.fromCallback(callback =>
    exec(`npm show ${name} versions --json`, (err, stdout, stderr) => {
      if (err) {
        /* istanbul ignore else */
        if (/Registry returned 404 for GET on/.test(stderr) || /404 Not found/.test(stderr)) {
          return callback(new Error(`The package you were looking for doesn't exist.`));
        } else {
          return callback(err);
        }
      } else {
        return callback(null, JSON.parse(stdout));
      }
    })
  );
};

const shouldResolve = pkg => /.*@([~^]|.*x)/.test(pkg);

const resolveVersionRange = pkg => {
  // unfortunately no named capture groups in Node 6..
  const match = pkg.match(/^(@?[^@]+)(?:@(.*?))?$/);
  if (!match) return Promise.reject(new Error(`Unable to parse package name ${pkg}`));
  const packageName = match[1];
  const version = match[2];
  if (!shouldResolve(pkg)) return getVersionList(packageName).return(pkg);
  return Promise.fromCallback(cb => {
    resolver({[packageName]: version}, function(err, result) {
      /* istanbul ignore if*/
      if (err) return cb(err);
      if (!_.has(result, `dependencies.${packageName}`))
        return cb(new Error(`Specified version range '${version}' is not resolvable`));
      return cb(null, `${packageName}@${result.dependencies[packageName].version}`);
    });
  });
};

const getDependencyList = packageDetails =>
  _.reduce(
    packageDetails.dependencies,
    (memo, value, key) => {
      return [...memo, `${key}@${value}`];
    },
    []
  );
module.exports = {getVersionList, shouldResolve, resolveVersionRange, getDependencyList};
