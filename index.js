const fetchPackageStats = require('./lib/fetch-package-stats');

if (!module.parent) {
    fetchPackageStats(process.argv[2])
        .then(packageState => console.log(packageState))
        .catch(err => console.error('Error happened:', err.message));
}
