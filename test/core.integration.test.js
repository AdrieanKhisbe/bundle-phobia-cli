const stripAnsi = require('strip-ansi');
const {main} = require('../src/core');

const fakeStream = () => {
  const content = [];
  return {
    write(chunk) {
      content.push(chunk);
    },
    getContent() {
      return content.join('');
    }
  };
};

describe('Integrations tests', () => {
  it('fetch just a single package', done => {
    const stream = fakeStream();
    // had to pin version for test stability
    return main({argv: {_: ['lodash@4.12.0']}, stream})
      .then(() => {
        const output = stream.getContent();
        expect(stripAnsi(output)).toEqual(
          `- Fetching stats for package lodash@4.12.0
ℹ lodash (4.12.0) has 0 dependencies for a weight of 63.14KB (22.01KB gzipped)
`
        );

        return done();
      })
      .catch(done);
  });
  it('fetch just a list of package', done => {
    const stream = fakeStream();
    // had to pin version for test stability
    return main({argv: {_: ['react@15', 'lodash@2', 'moment@1.2.0']}, stream})
      .then(() => {
        const output = stream.getContent();
        expect(stripAnsi(output)).toEqual(
          `- Fetching stats for package react@15
ℹ react (15.0.0) has 3 dependencies for a weight of 19.96KB (6.46KB gzipped)
- Fetching stats for package lodash@2
ℹ lodash (2.0.0) has 0 dependencies for a weight of 26.17KB (9.52KB gzipped)
- Fetching stats for package moment@1.2.0
ℹ moment (1.2.0) has 0 dependencies for a weight of 114.1KB (14.83KB gzipped)

ℹ total (3 packages) has 3 dependencies for a weight of 160.23KB (30.81KB gzipped)
`
        );

        return done();
      })
      .catch(done);
  });
  it('fetch just a list of package', done => {
    const stream = fakeStream();
    // had to pin version for test stability
    return main({
      argv: {_: ['react@15', 'lodash@2', 'moment@1.2'], range: 2, r: 2},
      stream
    })
      .catch(err => {
        expect(err.message).toEqual("Can't use both --range option and list of packages");
      })
      .asCallback(done);
  });

  it('fetch a package that does not exist at all', done => {
    const stream = fakeStream();
    // had to pin version for test stability
    return main({
      argv: {_: ['sorry-but-i-really-do-not-exist']},
      stream
    })
      .then(() => {
        const output = stream.getContent();
        return expect(stripAnsi(output)).toEqual(
          `- Fetching stats for package sorry-but-i-really-do-not-exist
✖ resolving sorry-but-i-really-do-not-exist failed: The package you were looking for doesn't exist.
`
        );
      })
      .asCallback(done);
  });

  it('fetch a package that does not exist at all with range', done => {
    const stream = fakeStream();
    // had to pin version for test stability
    return main({
      argv: {_: ['sorry-but-i-really-do-not-exist'], range: 2, r: 2},
      stream
    })
      .catch(err => {
        expect(err.message).toEqual(
          "sorry-but-i-really-do-not-exist: The package you were looking for doesn't exist."
        );
      })
      .asCallback(done);
  });
});
