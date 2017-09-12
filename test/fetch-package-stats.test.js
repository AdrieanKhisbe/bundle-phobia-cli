const fetch = require('jest-fetch-mock');
jest.setMock('node-fetch', fetch);

const {fetchPackageStats, getVersionList} = require('../lib/fetch-package-stats');
const {lodashStats, errorStats} = require('./fixtures');

describe('fetchPackageStats', () => {

    it('simple get package', () => {
        fetch.mockResponse(JSON.stringify(lodashStats));
        return fetchPackageStats('lodash').then(stats => {
            expect(stats).toEqual(lodashStats)
        })
    });

    it('undefined package name', () => {
        return fetchPackageStats()
            .catch(err => expect(err.message).toEqual('Empty name given as argument'))
    });

    it('unexisting package name', () => {
        fetch.mockResponse(JSON.stringify(errorStats));
        return fetchPackageStats('yolodonotexist')
            .catch(err => expect(err.message).toEqual('The package you were looking for doesn\'t exist.'))
    });

});

describe('getVersionList', () => {

    it('get the version list of an existing package', () => {
        return getVersionList('lodash')
            .then(versionList => {
                expect(versionList.length > 50).toBeTruthy()
                expect(versionList).toEqual(expect.arrayContaining(['0.1.0', '0.2.0', '4.12.0', '4.16.4']));
            });
    });

    it('get the version list of an unknown package', () => {
        return getVersionList('nonmaiscaexistepas')
            .catch(err => expect(err.message).toEqual('Unknown Package nonmaiscaexistepas'));
    })

});
