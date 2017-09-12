const fetch = require('node-fetch');

const fetchPackageStats = name =>
    fetch(`https://bundlephobia.com/api/size?package=${name}`)
        .then(res => res.json());

module.exports = fetchPackageStats;