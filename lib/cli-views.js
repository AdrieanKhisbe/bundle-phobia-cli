const c = require('chalk');

const syntheticView = stat => {
    return `${c.bold.underline(stat.name)} (${c.grey.dim(stat.version)
    }) has ${c.blue.bold(stat.dependencyCount)} for a weight of ${c.cyan.bold(stat.size)
    } (${c.dim.bold(stat.gzip)})`
}
// TODO: later dynamic color + kilo printing

module.exports.syntheticView = syntheticView;
