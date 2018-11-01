const Promise = require('bluebird');
const {exec} = require('child_process');
const {resolver} = require('resolve-package-json');

const getVersionList = name => {
  if (!name) return Promise.reject(new Error('Empty name given as argument'));
  return Promise.fromCallback(callback =>
    exec(`npm show ${name} versions --json`, (err, stdout, stderr) => {
      if (err) {
        if (/Registry returned 404 for GET on/.test(stderr) || /404 Not found/.test(stderr)) {
          callback(new Error(`Unknown Package ${name}`));
        } else {
          callback(err);
        }
      } else {
        callback(null, JSON.parse(stdout));
      }
    })
  );
};

const shouldResolve = pkg => /.*@([~^]|.*x)/.test(pkg);

const resolveVersionRange = pkg => {
  if (!shouldResolve(pkg)) return Promise.resolve(pkg);
  return Promise.fromCallback(cb => {
    const [packageName, version] = pkg.split('@');
    resolver({[packageName]: version}, function(err, result) {
      if (err) return cb(err);
      return cb(null, `${packageName}@${result.dependencies[packageName].version}`);
    });
  });
};

module.exports = {getVersionList, shouldResolve, resolveVersionRange};
