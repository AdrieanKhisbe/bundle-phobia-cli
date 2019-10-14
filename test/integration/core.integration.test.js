const {main} = require('../../src/core');
const index = require('../../src'); // eslint-disable-line no-unused-vars
const {fakeStream} = require('./utils');

describe('Integrations tests', () => {
  it('fetch just a single package', async () => {
    const stream = fakeStream();
    // had to pin version for test stability
    await main({argv: {_: ['lodash@4.12.0']}, stream});

    expect(stream.getContent()).toEqual(
      `- Fetching stats for package lodash@4.12.0
ℹ lodash (4.12.0) has 0 dependencies for a weight of 63.65KB (22.11KB gzipped)
`
    );
  });
  it('fetch just a list of package', async () => {
    const stream = fakeStream();
    // had to pin version for test stability
    await main({argv: {_: ['lodash@2.4.2', 'moment@1.2.0']}, stream});

    expect(stream.getContent()).toEqual(
      `- Fetching stats for package lodash@2.4.2
ℹ lodash (2.4.2) has 0 dependencies for a weight of 27.94KB (10.04KB gzipped)
- Fetching stats for package moment@1.2.0
ℹ moment (1.2.0) has 0 dependencies for a weight of 114.1KB (14.83KB gzipped)

ℹ total (2 packages) has 0 dependencies for a weight of 142.04KB (24.87KB gzipped)
`
    );
  }, 10000);
  it('fetch just a list of package', async () => {
    const stream = fakeStream();
    try {
      await main({
        argv: {_: ['react@15', 'lodash@2', 'moment@1.2'], range: 2, r: 2},
        stream
      });
      throw new Error('Did not fail as expected');
    } catch (err) {
      expect(err.message).toEqual("Can't use both --range option and list of packages");
    }
  });

  it('fetch a package that does not exist at all', async () => {
    const stream = fakeStream();
    await expect(
      main({
        argv: {_: ['sorry-but-i-really-do-not-exist']},
        stream
      })
    ).rejects.toThrow("The package you were looking for doesn't exist.");
    expect(stream.getContent()).toEqual(
      `- Fetching stats for package sorry-but-i-really-do-not-exist
✖ resolving sorry-but-i-really-do-not-exist failed: The package you were looking for doesn't exist.
`
    );
  });

  it('fetch a package that does not exist at all with range', async () => {
    const stream = fakeStream();
    try {
      await main({
        argv: {_: ['sorry-but-i-really-do-not-exist'], range: 2, r: 2},
        stream
      });

      throw new Error('Did not fail as expected');
    } catch (err) {
      expect(err.message).toEqual(
        "sorry-but-i-really-do-not-exist: The package you were looking for doesn't exist."
      );
    }
  });
});
