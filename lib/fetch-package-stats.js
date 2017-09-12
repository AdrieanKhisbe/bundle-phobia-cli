const fetch = require('node-fetch');
const Promise = require('bluebird');
fetch.Promise = Promise;
const {exec} = require('child_process');

const fetchPackageStats = name => {
    if (!name) return Promise.reject(new Error('Empty name given as argument'))
    return fetch(`https://bundlephobia.com/api/size?package=${name}`)
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

const getVersionList = name => {
    if (!name) return Promise.reject(new Error('Empty name given as argument'))
    return Promise.fromCallback(callback =>
        exec(`npm show ${name} versions --json`, (err, stdout, stderr) => {
            if (err) {
                if (/Registry returned 404 for GET on/.test(stderr)) {
                    callback(new Error(`Unknown Package ${name}`));
                } else {
                    callback(err);
                }
            } else {
                callback(null, JSON.parse(stdout));
            }

        })
    )
};

const fetchPackageStatsByVersion = (name, limit = 8) => {
    return getVersionList(name)
        .then(versionList => {
            versionList.reverse();
            if (limit <= 0) return versionList;
            else return versionList.slice(0, limit);
        })
        .then(versionList => fetchPackageStatsForVersionList(name, versionList));
};


module.exports.fetchPackageStats = fetchPackageStats;
module.exports.getVersionList = getVersionList;
module.exports.fetchPackageStatsByVersion = fetchPackageStatsByVersion;
