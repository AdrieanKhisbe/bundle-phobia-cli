const fetch = require('jest-fetch-mock');
jest.setMock('node-fetch', fetch);

const fetchPackageStats = require('../lib/fetch-package-stats');
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
