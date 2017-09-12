const c = require('chalk');

const syntheticView = stat => {
    return `${c.bold.underline(stat.name)} (${c.grey.dim(stat.version)
    }) has ${c.blue.bold(stat.dependencyCount)} dependencies for a weight of ${c.cyan.bold(stat.size)
    }B (${c.dim.bold(stat.gzip)}B gzipped)`
}
// TODO: later dynamic color + kilo printing + plural

module.exports.syntheticView = syntheticView;
