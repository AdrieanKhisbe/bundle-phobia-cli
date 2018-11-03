const {getVersionList, resolveVersionRange} = require('../src/npm-utils');

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

  it('get the version list with non argument', () => {
    return getVersionList().catch(err =>
      expect(err.message).toEqual('Empty name given as argument')
    );
  });
});

describe('resolveVersionRange', () => {
  it('simple package with no version', () => {
    return resolveVersionRange('whatever').then(version => {
      return expect(version).toEqual('whatever');
    });
  });
  it('simple package with version not to be resolved', () => {
    return resolveVersionRange('whatever@2.2.2').then(version => {
      return expect(version).toEqual('whatever@2.2.2');
    });
  });
  it('simple package wich does not exist', () => {
    return resolveVersionRange('publish-me-to-break-the-test').catch(err => {
      return expect(err.message).toEqual("The package you were looking for doesn't exist.");
    });
  });

  it('simple package with version to be resolved but cant', () => {
    return resolveVersionRange('lodash@~2.2.2').catch(err => {
      return expect(err.message).toEqual("Specified version range '~2.2.2' is not resolvable");
    });
  });
  it('simple package with version to be resolved', () => {
    return resolveVersionRange('lodash@~4.16.4').then(version => {
      return expect(version).toEqual('lodash@4.16.6');
    });
  });
});
