const fetchPackageStats = require('./lib/fetch-package-stats');

if(!module.parent)
    fetchPackageStats(process.argv[2])
        .then(packageState => console.log(packageState));