const fetch = require('node-fetch');

const fetchPackageStats = name => {
    if(!name) return Promise.reject(new Error('Empty name given as argument'))
    return fetch(`https://bundlephobia.com/api/size?package=${name}`)
        .then(res => res.json())
        .then(json => {
            if(json.error) throw new Error(json.error.message)
            return json;
        });
};

module.exports = fetchPackageStats;