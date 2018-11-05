const fetch = require('node-fetch');
const Promise = require('bluebird');

fetch.Promise = Promise;
const {getVersionList, resolveVersionRange, getDependencyList} = require('./npm-utils');

const fetchPackageStats = name => {
  if (!name) return Promise.reject(new Error('Empty name given as argument'));
  return resolveVersionRange(name)
    .then(pkg =>
      fetch(`https://bundlephobia.com/api/size?package=${pkg}`, {
        headers: {'User-Agent': 'bundle-phobia-cli', 'X-Bundlephobia-User': 'bundle-phobia-cli'}
      })
    )
    .then(res => res.json())
    .then(json => {
      if (json.error) throw new Error(json.error.message);
      return json;
    });
};
const fetchPackagesStats = names => Promise.map(names, fetchPackageStats);
const fetchPackageJsonStats = packageDetails =>
  fetchPackagesStats(getDependencyList(packageDetails));

const selectVersions = (versionList, limit) => {
  versionList.reverse();
  if (limit <= 0) return versionList;
  else return versionList.slice(0, limit);
};

const getPackageVersionList = (name, limit = 8) => {
  return getVersionList(name)
    .then(versionList => selectVersions(versionList, limit))
    .map(version => `${name}@${version}`);
};

module.exports = {fetchPackageStats, fetchPackageJsonStats, selectVersions, getPackageVersionList};
