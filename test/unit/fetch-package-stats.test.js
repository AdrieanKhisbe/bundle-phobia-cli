const path = require('path');
const test = require('ava');

const {
  fetchPackageStats,
  selectVersions,
  getPackagesFromPackageJson
} = require('../../src/fetch-package-stats');

const {lodashStats, errorStats, missingVersionErrorStats} = require('./fixtures');
// §FIXME : see fixtures, schema updated, have a look into that

const fakeFetch = payload => () =>
  Promise.resolve({
    json: () => Promise.resolve(payload)
  });

test('fetchPackageStats - simple get package', async t => {
  const stats = await fetchPackageStats('lodash', {fetch: fakeFetch(lodashStats)});
  t.deepEqual(stats, lodashStats);
});

test('fetchPackageStats - undefined package name', async t => {
  await t.throwsAsync(fetchPackageStats(), {message: 'Empty name given as argument'});
});

// Disabling this test because of bundlephobia gateway-timeout
test('fetchPackageStats - unexisting package name', async t => {
  await t.throwsAsync(
    fetchPackageStats('yolodonotexist', {
      fetch: fakeFetch(errorStats)
    }),
    {message: "The package you were looking for doesn't exist."}
  );
});

test('fetchPackageStats -unexisting version of package', async t => {
  await t.throwsAsync(
    fetchPackageStats('lodash@4000', {
      fetch: fakeFetch(missingVersionErrorStats)
    }),
    {
      message: `This package has not been published with this particular version.
    Valid versions - latest, 0.2.2`
    }
  );
});

test('selectVersions - select all the list implicitely', t => {
  const list = ['1', '2', '3'];
  t.deepEqual(selectVersions(list, 4), ['3', '2', '1']);
});

test('selectVersions - select all the list explicitely', t => {
  const list = ['1', '2', '3'];
  t.deepEqual(selectVersions(list, 0), ['3', '2', '1']);
});

test('selectVersions - select just the first elements', t => {
  const list = ['1', '2', '3'];
  t.deepEqual(selectVersions(list, 2), ['3', '2']);
});

test('selectVersions - returns Package Version list with name', async t => {
  const versionList = await selectVersions(['0.1', '0.2', '1'], -1, 'lodash');
  t.deepEqual(versionList, ['lodash@1', 'lodash@0.2', 'lodash@0.1']);
});
test('selectVersions - returns partial Package Version list', t => {
  const versionList = selectVersions(['0.1', '0.2', '1'], 2, 'lodash');
  t.deepEqual(versionList, ['lodash@1', 'lodash@0.2']);
});

test('getPackagesFromPackageJson - fetch data from an existing package.json', async t => {
  const packageJsonPath = path.join(__dirname, 'package.fixture.json');
  const res = await getPackagesFromPackageJson(packageJsonPath);
  t.deepEqual(res, [
    'bluebird@^3.5.2',
    'chalk@^2.4.1',
    'lodash@^4.17.11',
    'ora@^3.0.0',
    'shelljs@^0.8.2',
    'yargs@^12.0.2'
  ]);
});

test('getPackagesFromPackageJson fails when file does not exist', async t => {
  const packageJsonPath = path.join(__dirname, 'missing-package.json');
  await t.throwsAsync(getPackagesFromPackageJson(packageJsonPath), {
    message: /ENOENT: no such file or directory/
  });
});
