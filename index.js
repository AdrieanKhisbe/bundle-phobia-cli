const fetch = require('node-fetch');

const fetchPackageStats = name =>
    fetch(`https://bundlephobia.com/api/size?package=${name}`)
        .then(res => res.json());

if(!module.parent)
    fetchPackageStats(process.argv[2])
        .then(packageState => console.log(packageState));