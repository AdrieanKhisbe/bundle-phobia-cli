const c = require('chalk');
const _ = require('lodash')

const syntheticView = stat => {
    return `${c.bold.underline(stat.name)} (${c.grey.dim(stat.version)
    }) has ${c.blue.bold(stat.dependencyCount)} dependencies for a weight of ${c.cyan.bold(stat.size)
    }B (${c.dim.bold(stat.gzip)}B gzipped)`
}
// TODO: later dynamic color + kilo printing + plural
const jsonView = JSON.stringify;

const sizeView = stat => stat.size;
const gzipsizeView = stat => stat.gzip;
const dependenciesView = stat => stat.dependencyCount;

const getView = argv => {
    const viewOpts = _.intersection(_.keys(argv).filter(key => argv[key]), ['json', 'gzip-size', 'size', 'dependencies'])
    if (_.size(viewOpts) > 1)
        throw new Error(`Can't use in the same time options ${viewOpts}`)

    if(argv.json) return jsonView;
    if(argv['gzip-size']) return gzipsizeView;
    if(argv.size) return sizeView;
    if(argv.dependencies) return dependenciesView;
    return syntheticView;
};

module.exports.syntheticView = syntheticView;
module.exports.jsonView = jsonView;
module.exports.getView = getView;
module.exports.sizeView = sizeView;
module.exports.gzipsizeView = gzipsizeView;
module.exports.getView = getView;
