const path = require('path');
const fetch = require('jest-fetch-mock');

jest.setMock('node-fetch', fetch);
const {
  fetchPackageStats,
  selectVersions,
  getPackagesFromPackageJson,
  getPackageVersionList
} = require('../../src/fetch-package-stats');

jest.mock('../../src/npm-utils');
const npmUtils = require('../../src/npm-utils');

const {lodashStats, errorStats, missingVersionErrorStats} = require('./fixtures');
// §FIXME : see fixtures, schema updated, have a look into that

describe('fetchPackageStats', () => {
  it('simple get package', async () => {
    fetch.mockResponse(JSON.stringify(lodashStats));
    const stats = await fetchPackageStats('lodash');
    expect(stats).toEqual(lodashStats);
  });

  it('undefined package name', async () => {
    await expect(fetchPackageStats()).rejects.toThrow('Empty name given as argument');
  });

  // Disabling this test because of bundlephobia gateway-timeout
  it('unexisting package name', async () => {
    fetch.mockResponse(JSON.stringify(errorStats));
    expect(fetchPackageStats('yolodonotexist')).rejects.toThrow(
      "The package you were looking for doesn't exist."
    );
  });
  it('unexisting version of package', async () => {
    fetch.mockResponse(JSON.stringify(missingVersionErrorStats));
    await expect(fetchPackageStats('lodash@4000')).rejects
      .toThrow(`This package has not been published with this particular version.
    Valid versions - latest, 0.2.2`);
  });
});

describe('selectVersions', () => {
  it('select all the list implicitely', () => {
    const list = ['1', '2', '3'];
    expect(selectVersions(list, 4)).toEqual(['3', '2', '1']);
  });

  it('select all the list explicitely', () => {
    const list = ['1', '2', '3'];
    expect(selectVersions(list, 0)).toEqual(['3', '2', '1']);
  });

  it('select just the first elements', () => {
    const list = ['1', '2', '3'];
    expect(selectVersions(list, 2)).toEqual(['3', '2']);
  });
});

describe('getVersionList', () => {
  it('returns Package Version list', async () => {
    npmUtils.getVersionList.mockReturnValue(Promise.resolve(['0.1', '0.2', '1']));
    const versionList = await getPackageVersionList('lodash');
    expect(versionList).toEqual(['lodash@1', 'lodash@0.2', 'lodash@0.1']);
  });
  it('returns partial Package Version list', async () => {
    npmUtils.getVersionList.mockReturnValue(Promise.resolve(['0.1', '0.2', '1']));
    const versionList = await getPackageVersionList('lodash', 2);
    expect(versionList).toEqual(['lodash@1', 'lodash@0.2']);
  });
});

describe('getPackagesFromPackageJson', () => {
  it('fetch data from an existing package.json', async () => {
    npmUtils.getDependencyList.mockImplementation(
      jest.requireActual('../../src/npm-utils').getDependencyList
    ); // jest is magic... 😑
    const packageJsonPath = path.join(__dirname, 'package.fixture.json');
    const res = await getPackagesFromPackageJson(packageJsonPath);
    expect(res).toEqual([
      'bluebird@^3.5.2',
      'chalk@^2.4.1',
      'lodash@^4.17.11',
      'ora@^3.0.0',
      'shelljs@^0.8.2',
      'yargs@^12.0.2'
    ]);
  });
  it('fails when file does not exist', async () => {
    const packageJsonPath = path.join(__dirname, 'missing-package.json');
    await expect(getPackagesFromPackageJson(packageJsonPath)).rejects.toThrow(
      /ENOENT: no such file or directory/
    );
  });
});
