const {getVersionList} = require('../src/npm-utils');

describe('getVersionList', () => {
  it('get the version list of an existing package', () => {
    return getVersionList('lodash').then(versionList => {
      expect(versionList.length > 50).toBeTruthy();
      return expect(versionList).toEqual(
        expect.arrayContaining(['0.1.0', '0.2.0', '4.12.0', '4.16.4'])
      );
    });
  });

  it('get the version list of an unknown package', () => {
    return getVersionList('nonmaiscaexistepas').catch(err =>
      expect(err.message).toEqual("The package you were looking for doesn't exist.")
    );
  });
});
