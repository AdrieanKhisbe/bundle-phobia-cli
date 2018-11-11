const path = require('path');
const fetch = require('jest-fetch-mock');
const Bromise = require('bluebird');

jest.setMock('node-fetch', fetch);
const {
  fetchPackageStats,
  selectVersions,
  getPackagesFromPackageJson,
  getPackageVersionList
} = require('../src/fetch-package-stats');

jest.mock('../src/npm-utils');
const {resolveVersionRange, getVersionList} = require('../src/npm-utils');

const {lodashStats, errorStats, missingVersionErrorStats} = require('./fixtures');
// §FIXME : see fixtures, schema updated, have a look into that

describe('fetchPackageStats', () => {
  resolveVersionRange.mockImplementation(name => Bromise.resolve(name));

  it('simple get package', () => {
    fetch.mockResponse(JSON.stringify(lodashStats));
    return fetchPackageStats('lodash').then(stats => {
      return expect(stats).toEqual(lodashStats);
    });
  });

  it('undefined package name', () => {
    return fetchPackageStats().catch(err =>
      expect(err.message).toEqual('Empty name given as argument')
    );
  });

  // Disabling this test because of bundlephobia gateway-timeout
  it('unexisting package name', () => {
    fetch.mockResponse(JSON.stringify(errorStats));
    return fetchPackageStats('yolodonotexist').catch(err =>
      expect(err.message).toEqual("The package you were looking for doesn't exist.")
    );
  });
  it('unexisting version of package', () => {
    fetch.mockResponse(JSON.stringify(missingVersionErrorStats));
    return fetchPackageStats('lodash@4000').catch(err =>
      expect(err.message).toEqual(`This package has not been published with this particular version.
    Valid versions - latest, 0.2.2`)
    );
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
  it('returns Package Version list', () => {
    getVersionList.mockReturnValue(Bromise.resolve(['0.1', '0.2', '1']));
    const versionList = getPackageVersionList('lodash');
    return expect(versionList).resolves.toEqual(['lodash@1', 'lodash@0.2', 'lodash@0.1']);
  });
  it('returns partial Package Version list', () => {
    getVersionList.mockReturnValue(Bromise.resolve(['0.1', '0.2', '1']));
    const versionList = getPackageVersionList('lodash', 2);
    return expect(versionList).resolves.toEqual(['lodash@1', 'lodash@0.2']);
  });
});

describe('getPackagesFromPackageJson', () => {
  it('fetch data from an existing package.json', () => {
    const packageJsonPath = path.join(__dirname, 'test-package.json');
    const res = getPackagesFromPackageJson(packageJsonPath);
    return expect(res).resolves.toEqual([
      'bluebird@^3.5.2',
      'chalk@^2.4.1',
      'lodash@^4.17.11',
      'ora@^3.0.0',
      'shelljs@^0.8.2',
      'yargs@^12.0.2'
    ]);
  });
  it('fails when file does not exist', () => {
    expect.assertions(1);
    const packageJsonPath = path.join(__dirname, 'missing-package.json');
    const res = getPackagesFromPackageJson(packageJsonPath);
    return res.catch(err =>
      expect(err.message).toEqual(expect.stringMatching('ENOENT: no such file or directory'))
    );
  });
});
