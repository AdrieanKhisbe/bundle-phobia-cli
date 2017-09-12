const fetch = require('jest-fetch-mock');
jest.setMock('node-fetch', fetch);

const lodashStats = {
    dependencyCount: 0,
    gzip: 24666,
    hasJSModule: false,
    hasJSNext: false,
    name: 'lodash',
    scoped: false,
    size: 70870,
    version: '4.17.4'
};

const fetchPackageStats = require('../lib/fetch-package-stats')

describe('fetchPackageStats', () => {

    it('simple get package', () => {
        fetch.mockResponse(JSON.stringify(lodashStats));
        return fetchPackageStats('lodash').then(stats => {
            expect(stats).toEqual(lodashStats)
        })
    });

    it('undefined package name');

    it('unexisting package name');

});