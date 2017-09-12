const Promise = require('bluebird');
const {exec} = require('child_process');

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

module.exports.getVersionList = getVersionList;
