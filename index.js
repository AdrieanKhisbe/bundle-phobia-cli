const fetchPackageStats = require('./lib/fetch-package-stats');
const {syntheticView} = require('./lib/cli-views');

if (!module.parent) {
    fetchPackageStats(process.argv[2])
        .then(packageState => console.log(syntheticView(packageState)))
        .catch(err => console.error('Error happened:', err.message));
}
