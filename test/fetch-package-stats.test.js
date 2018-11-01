const fetch = require('jest-fetch-mock');
const Bromise = require('bluebird');

jest.setMock('node-fetch', fetch);

const {fetchPackageStats, selectVersions} = require('../lib/fetch-package-stats');

jest.mock('../lib/npm-utils');
const {resolveVersionRange} = require('../lib/npm-utils');

const {lodashStats, errorStats} = require('./fixtures');

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

  it('unexisting package name', () => {
    fetch.mockResponse(JSON.stringify(errorStats));
    return fetchPackageStats('yolodonotexist').catch(err =>
      expect(err.message).toEqual("The package you were looking for doesn't exist.")
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
