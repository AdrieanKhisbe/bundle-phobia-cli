const lodashStats = {
  dependencyCount: 0,
  gzip: 24_666,
  hasJSModule: false,
  hasJSNext: false,
  name: 'lodash',
  scoped: false,
  size: 70_870,
  version: '4.17.4'
};

const errorStats = {
  error: {
    code: 'PackageNotFoundError',
    message: "The package you were looking for doesn't exist.",
    details: {}
  }
};
const unexpectedErrorStats = {
  error: {
    code: 'OhNo',
    message: 'Unexpected error happened.',
    details: {}
  }
};

const missingVersionErrorStats = {
  error: {
    code: 'PackageNotFoundError',
    message: `This package has not been published with this particular version.
    Valid versions - latest, \`<code>0.2.2</code>\``,
    details: {}
  }
};

export {lodashStats, errorStats, missingVersionErrorStats, unexpectedErrorStats};
