const fs = require('fs');
const path = require('path');
const _ = require('lodash/fp');

const {getVersionList, resolveVersionRange, getDependencyList} = require('./npm-utils');

const fetchPackageStats = async (name, {fetch = globalThis.fetch} = {}) => {
  if (!name) throw new Error('Empty name given as argument');
  const pkg = await resolveVersionRange(name);
  const res = await fetch(`https://bundlephobia.com/api/size?package=${pkg}`, {
    headers: {'User-Agent': 'bundle-phobia-cli', 'X-Bundlephobia-User': 'bundle-phobia-cli'}
  });
  const json = await res.json();

  if (!json.error) return json;

  const errMessage = json.error.message;
  if (errMessage.startsWith('This package has not been published with this particular version.'))
    throw new Error(errMessage.replace(/`<code>|<\/code>`/g, ''));

  throw new Error(errMessage);
};
const fetchPackagesStats = names => Promise.all(names.map(fetchPackageStats));
const fetchPackageJsonStats = packageDetails =>
  fetchPackagesStats(getDependencyList(packageDetails));

const selectVersions = (versionList, limit, formatWithName = null) =>
  _.pipe(
    _.reverse,
    limit <= 0 ? _.identity : _.slice(0, limit),
    formatWithName ? _.map(version => `${formatWithName}@${version}`) : _.identity
  )(versionList);

const getPackageVersionList = async (name, limit = 8) => {
  const versionList = await getVersionList(name);
  return selectVersions(versionList, limit, name);
};

const resolvePackageJson = pkg => {
  if (_.endsWith('.json', pkg))
    // assume legitimate json  path provided
    return pkg;

  const fsStat = fs.statSync(pkg);
  const isDir = fsStat.isDirectory();
  if (!isDir) throw new Error('Provide json or folder with package.json');

  const packageCandidate = path.join(pkg, 'package.json');
  if (!fs.existsSync(packageCandidate)) throw new Error('No package.json found in provided folder');
  // note: this logic also support '.' as folder package.jsoon

  return packageCandidate;
};

const getPackagesFromPackageJson = async pkg => {
  const packageContent = JSON.parse(fs.readFileSync(resolvePackageJson(pkg)));
  return getDependencyList(packageContent);
};

module.exports = {
  fetchPackageStats,
  fetchPackageJsonStats,
  selectVersions,
  getPackageVersionList,
  resolvePackageJson,
  getPackagesFromPackageJson
};
