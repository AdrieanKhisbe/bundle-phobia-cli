const fetch = require('jest-fetch-mock');
jest.setMock('node-fetch', fetch);

const {fetchPackageStats, selectVersions, fetchPackageStatsByVersion} = require('../lib/fetch-package-stats');
const {lodashStats, errorStats} = require('./fixtures');

jest.mock('../lib/npm-utils');
const {getVersionList, resolveVersionRange} = require('../lib/npm-utils');

describe('fetchPackageStats', () => {
   resolveVersionRange.mockImplementation(name => Promise.resolve(name));

    it('simple get package', () => {
        fetch.mockResponse(JSON.stringify(lodashStats));
        return fetchPackageStats('lodash')
            .then(stats => {
            expect(stats).toEqual(lodashStats);
        });
    });

    it('undefined package name', () => {
        return fetchPackageStats()
            .catch(err => expect(err.message).toEqual('Empty name given as argument'));
    });

    it('unexisting package name', () => {
        fetch.mockResponse(JSON.stringify(errorStats));
        return fetchPackageStats('yolodonotexist')
            .catch(err => expect(err.message).toEqual('The package you were looking for doesn\'t exist.'));
    });

});

describe('selectVersions', () => {

    it('select all the list implicitely', () => {
        const list = ['1', '2', '3']
        expect(selectVersions(list, 4)).toEqual(['3', '2', '1'])
    });

    it('select all the list explicitely', () => {
        const list = ['1', '2', '3']
        expect(selectVersions(list, 0)).toEqual(['3', '2', '1'])
    });

    it('select just the first elements', () => {
        const list = ['1', '2', '3']
        expect(selectVersions(list, 2)).toEqual(['3', '2'])
    });

});


describe('fetchPackageStatsByVersion', () => {

    it('simple get package with all version', () => {
        getVersionList.mockImplementation(() => Promise.resolve(['4.16.4', '4.12.0']));
        fetch.mockResponse(JSON.stringify(lodashStats));
        return fetchPackageStatsByVersion('lodash', 2)
            .then(stats => {
                expect(stats).toEqual([lodashStats, lodashStats]);
            });
    });

});
