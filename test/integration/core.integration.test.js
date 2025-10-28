const test = require('ava');
const _ = require('lodash/fp');
const {main} = require('../../src/core');
const index = require('../../src'); // eslint-disable-line no-unused-vars
const {fakeStream} = require('./utils');

test('fetch just a single package', async t => {
  const stream = fakeStream();
  // had to pin version for test stability
  await main({argv: {packages: ['lodash@4.12.0']}, stream});

  t.is(
    stream.getContent({stripKbSizes: true}),
    `- Fetching stats for package lodash@4.12.0
ℹ lodash (4.12.0) has 0 dependencies for a weight of XXXKB (XXXKB gzipped)
`
  );
});

test('fetch just a list of package', async t => {
  const stream = fakeStream();
  // had to pin version for test stability
  await main({argv: {packages: ['lodash@2.4.2', 'moment@1.2.0'], serial: 1}, stream});
  const EXPECT_TEXT = `- Fetching stats for package lodash@2.4.2
ℹ lodash (2.4.2) has 0 dependencies for a weight of XXXKB (XXXKB gzipped)
- Fetching stats for package moment@1.2.0
ℹ moment (1.2.0) has 0 dependencies for a weight of XXXKB (XXXKB gzipped)

ℹ total (2 packages) has 0 dependencies for a weight of XXXKB (XXXKB gzipped)
`;

  t.deepEqual(
    stream.getContent({stripKbSizes: true}).split('\n').sort(),
    EXPECT_TEXT.split('\n').sort()
  );
});

test('fetch all not stoping on error', async t => {
  const stream = fakeStream();
  // had to pin version for test stability
  await t.throwsAsync(
    () =>
      main({
        argv: {packages: ['lodash@2.4.2', '@oh-no/no-noooo', 'moment@1.2.0'], serial: 1},
        stream
      }),
    {message: /The package you were looking for doesn't exist./}
    // TODO: enforce exact wording (and adequate formating)
  );
  t.is(
    stream.getContent({stripKbSizes: true}),
    `- Fetching stats for package lodash@2.4.2
ℹ lodash (2.4.2) has 0 dependencies for a weight of XXXKB (XXXKB gzipped)
- Fetching stats for package @oh-no/no-noooo
✖ resolving @oh-no/no-noooo failed: The package you were looking for doesn't exist.
- Fetching stats for package moment@1.2.0
ℹ moment (1.2.0) has 0 dependencies for a weight of XXXKB (XXXKB gzipped)
`
  );
});

test('fetch all stoping on first error with flag', async t => {
  const stream = fakeStream();
  // had to pin version for test stability
  const err = await main({
    argv: {
      packages: ['lodash@2.4.2', '@oh-no/no-noooo', 'moment@1.2.0'],
      serial: 1,
      'fail-fast': true
    },
    stream
  }).catch(err => err);

  t.is(
    stream.getContent({stripKbSizes: true}),
    `- Fetching stats for package lodash@2.4.2
ℹ lodash (2.4.2) has 0 dependencies for a weight of XXXKB (XXXKB gzipped)
- Fetching stats for package @oh-no/no-noooo
✖ resolving @oh-no/no-noooo failed: The package you were looking for doesn't exist.
`
  );
  t.is(err.message, "The package you were looking for doesn't exist.");
});

test('fetch just a list of package serially', async t => {
  const stream = fakeStream();
  // had to pin version for test stability
  await main({argv: {packages: ['lodash@2.4.2', 'moment@1.2.0'], serial: 1}, stream});

  t.is(
    stream.getContent({stripKbSizes: true}),
    `- Fetching stats for package lodash@2.4.2
ℹ lodash (2.4.2) has 0 dependencies for a weight of XXXKB (XXXKB gzipped)
- Fetching stats for package moment@1.2.0
ℹ moment (1.2.0) has 0 dependencies for a weight of XXXKB (XXXKB gzipped)

ℹ total (2 packages) has 0 dependencies for a weight of XXXKB (XXXKB gzipped)
`
  );
});

test('prevent to fetch list of package with range', async t => {
  const stream = fakeStream();
  try {
    await main({
      argv: {packages: ['react@15', 'lodash@2', 'moment@1.2'], range: 2, r: 2},
      stream
    });
    throw new Error('Did not fail as expected');
  } catch (err) {
    t.is(err.message, "Can't use both --range option and list of packages");
  }
});

test('fetch from given package', async t => {
  const stream = fakeStream();
  await main({argv: {package: 'test/unit/package.json', packages: []}, stream});
  const sorted = _.pipe(_.split('\n'), _.sortBy(_.identity));

  t.deepEqual(
    sorted(stream.getContent({stripKbSizes: true})),
    sorted(`- Fetching stats for package bluebird@^3.5.2
- Fetching stats for package chalk@^2.4.1
- Fetching stats for package lodash@^4.17.11
- Fetching stats for package ora@^3.0.0
- Fetching stats for package shelljs@^0.8.2
- Fetching stats for package yargs@^12.0.2
ℹ lodash (4.17.21) has 0 dependencies for a weight of XXXKB (XXXKB gzipped)
ℹ bluebird (3.7.2) has 0 dependencies for a weight of XXXKB (XXXKB gzipped)
ℹ ora (3.4.0) has 6 dependencies for a weight of XXXKB (XXXKB gzipped)
ℹ chalk (2.4.2) has 3 dependencies for a weight of XXXKB (XXXKB gzipped)
ℹ shelljs (0.8.5) has 3 dependencies for a weight of XXXKB (XXXKB gzipped)
ℹ yargs (12.0.5) has 12 dependencies for a weight of XXXKB (XXXKB gzipped)

ℹ total (6 packages) has 24 dependencies for a weight of XXXKB (XXXKB gzipped)
`)
  );
});

test('fetch from current package', async t => {
  const stream = fakeStream();
  await main({argv: {package: undefined, p: undefined, packages: []}, stream});
  t.regex(
    stream.getContent({stripKbSizes: true}),
    /ℹ total \(\d+ packages\) has \d+ dependencies for a weight of XXXKB \(XXXKB gzipped\)/
  );
});

test('handle package with dot, using a caret version lock', async t => {
  const stream = fakeStream();
  await main({argv: {packages: ['ahoy.js@^0.3.5']}, stream});

  const [firstLine, secondLine] = stream.getContent().split('\n');
  t.is(firstLine, '- Fetching stats for package ahoy.js@^0.3.5');
  t.true(secondLine.startsWith('ℹ ahoy.js (0.', `Unexpected resolve entry: '${secondLine}'`));
});

test('fetch a package that does not exist at all', async t => {
  const stream = fakeStream();
  await t.throwsAsync(
    () =>
      main({
        argv: {packages: ['sorry-but-i-really-do-not-exist']},
        stream
      }),
    {message: "The package you were looking for doesn't exist."}
  );
  t.is(
    stream.getContent(),
    `- Fetching stats for package sorry-but-i-really-do-not-exist
✖ resolving sorry-but-i-really-do-not-exist failed: The package you were looking for doesn't exist.
`
  );
});

test('fetch a package that does not exist at all with range', async t => {
  const stream = fakeStream();
  try {
    await main({
      argv: {packages: ['sorry-but-i-really-do-not-exist'], range: 2, r: 2},
      stream
    });

    throw new Error('Did not fail as expected');
  } catch (err) {
    t.is(
      err.message,
      "sorry-but-i-really-do-not-exist: The package you were looking for doesn't exist."
    );
  }
});
