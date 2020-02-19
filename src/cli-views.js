const c = require('chalk');
const _ = require('lodash/fp');
const bytes = require('bytes');

const syntheticView = stat => {
  const size = bytes(stat.size);
  const gzip = bytes(stat.gzip);
  return `${c.bold.underline(stat.name)} (${c.grey.dim(stat.version)}) has ${c.blue.bold(
    stat.dependencyCount
  )} dependencies for a weight of ${c.cyan.bold(size)} (${c.dim.bold(gzip)} gzipped)`;
};
// TODO: later dynamic color + kilo printing + plural
const jsonView = JSON.stringify;

const sizeView = stat => stat.size;
const gzipsizeView = stat => stat.gzip;
const dependenciesView = stat => stat.dependencyCount;

const getView = (argv = {}) => {
  const viewOpts = _.intersection(
    _.keys(argv).filter(key => argv[key]),
    ['json', 'gzip-size', 'size', 'dependencies']
  );
  if (_.size(viewOpts) > 1)
    throw new Error(`Can't use in the same time options ${[...viewOpts].sort().join(', ')}`);

  if (argv.json) return jsonView;
  if (argv['gzip-size']) return gzipsizeView;
  if (argv.size) return sizeView;
  if (argv.dependencies) return dependenciesView;
  return syntheticView;
};

module.exports.syntheticView = syntheticView;
module.exports.jsonView = jsonView;
module.exports.sizeView = sizeView;
module.exports.gzipsizeView = gzipsizeView;
module.exports.dependenciesView = dependenciesView;
module.exports.getView = getView;
