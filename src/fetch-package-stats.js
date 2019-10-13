const fs = require('fs');
const fetch = require('node-fetch');

const {getVersionList, resolveVersionRange, getDependencyList} = require('./npm-utils');

const fetchPackageStats = async name => {
  if (!name) throw new Error('Empty name given as argument');
  const pkg = await resolveVersionRange(name);
  const res = (await fetch(`https://bundlephobia.com/api/size?package=${pkg}`, {
    headers: {'User-Agent': 'bundle-phobia-cli', 'X-Bundlephobia-User': 'bundle-phobia-cli'}
  })).json();

  if (!res.error) return res;

  const errMessage = res.error.message;
  if (errMessage.startsWith('This package has not been published with this particular version.'))
    throw new Error(errMessage.replace(/`<code>|<\/code>`/g, ''));

  throw new Error(errMessage);
};
const fetchPackagesStats = names => Promise.all(names.map(fetchPackageStats));
const fetchPackageJsonStats = packageDetails =>
  fetchPackagesStats(getDependencyList(packageDetails));

const selectVersions = (versionList, limit) => {
  versionList.reverse();
  if (limit <= 0) return versionList;
  else return versionList.slice(0, limit);
};

const getPackageVersionList = async (name, limit = 8) => {
  const versionList = await getVersionList(name);
  return selectVersions(versionList, limit).map(version => `${name}@${version}`);
};

const getPackagesFromPackageJson = async pkg => {
  const packageContent = JSON.parse(fs.readFileSync(pkg));
  return getDependencyList(packageContent);
};

module.exports = {
  fetchPackageStats,
  fetchPackageJsonStats,
  selectVersions,
  getPackageVersionList,
  getPackagesFromPackageJson
};
