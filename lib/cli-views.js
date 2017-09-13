const c = require('chalk');

const syntheticView = stat => {
    return `${c.bold.underline(stat.name)} (${c.grey.dim(stat.version)
    }) has ${c.blue.bold(stat.dependencyCount)} dependencies for a weight of ${c.cyan.bold(stat.size)
    }B (${c.dim.bold(stat.gzip)}B gzipped)`
}
// TODO: later dynamic color + kilo printing + plural
const jsonView = JSON.stringify;

const sizeView = stat => stat.size;
const gzipsizeView = stat => stat.gzip;

const getView = argv => {
    // TODO check not many options
    if(argv.json) return jsonView;
    if(argv['gzip-size']) return gzipsizeView;
    if(argv.size) return sizeView;
    return syntheticView;
};

module.exports.syntheticView = syntheticView;
module.exports.jsonView = jsonView;
module.exports.getView = getView;
module.exports.sizeView = sizeView;
module.exports.gzipsizeView = gzipsizeView;
module.exports.getView = getView;
