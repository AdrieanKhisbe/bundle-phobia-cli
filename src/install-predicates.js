const bytes = require('bytes');

const sizePredicate = threshold => {
  const realThreshold = bytes(threshold.toString());

  const predicate = stats => {
    if (stats.size <= realThreshold) return {canInstall: true};

    return {
      canInstall: false,
      reason: 'size over threshold',
      details: `${bytes(stats.size)} > ${bytes(realThreshold)}`
    };
  };
  predicate.description = `size limit of ${bytes(realThreshold)}`;
  predicate.threshold = realThreshold;
  return predicate;
};

const gzipSizePredicate = threshold => {
  const realThreshold = bytes(threshold.toString());

  const predicate = stats => {
    if (stats.gzip <= realThreshold) return {canInstall: true};

    return {
      canInstall: false,
      reason: 'gzip size over threshold',
      details: `${bytes(stats.gzip)} > ${bytes(realThreshold)}`
    };
  };
  predicate.description = `gzip size limit of ${bytes(realThreshold)}`;
  predicate.threshold = realThreshold;
  return predicate;
};

module.exports = {sizePredicate, gzipSizePredicate};
