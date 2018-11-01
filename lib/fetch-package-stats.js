const fetch = require('node-fetch');
const Promise = require('bluebird');
fetch.Promise = Promise;
const {getVersionList, resolveVersionRange} = require('./npm-utils');

const fetchPackageStats = name => {
    if (!name) return Promise.reject(new Error('Empty name given as argument'))
    return resolveVersionRange(name).then(package =>
         fetch(`https://bundlephobia.com/api/size?package=${package}`,
        {headers: {'User-Agent': 'bundle-phobia-cli', 'X-Bundlephobia-User': 'bundle-phobia-cli'}}))
        .then(res => res.json())
        .then(json => {
            if (json.error) throw new Error(json.error.message)
            return json;
        });
};

const fetchPackageStatsForVersionList = (name, versions) => {
   return Promise.map(versions, version => {
       return fetchPackageStats(`${name}@${version}`);
   });
}

const selectVersions = (versionList, limit) => {
    versionList.reverse();
    if (limit <= 0) return versionList;
    else return versionList.slice(0, limit);
};

const fetchPackageStatsByVersion = (name, limit = 8) => {
    return getVersionList(name)
        .then(versionList => selectVersions(versionList, limit))
        .then(versionList => fetchPackageStatsForVersionList(name, versionList));
};


module.exports.fetchPackageStats = fetchPackageStats;
module.exports.getVersionList = getVersionList;
module.exports.fetchPackageStatsByVersion = fetchPackageStatsByVersion;
module.exports.selectVersions = selectVersions;
