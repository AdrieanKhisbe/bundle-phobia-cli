const {getVersionList, resolveVersionRange} = require('../../src/npm-utils');

describe('getVersionList', () => {
  it('get the version list of an existing package', async () => {
    const versionList = await getVersionList('lodash');
    expect(versionList.length > 50).toBeTruthy();
    expect(versionList).toEqual(expect.arrayContaining(['0.1.0', '0.2.0', '4.12.0', '4.16.4']));
  });

  it('get the version list of an unknown package', async () => {
    await expect(getVersionList('nonmaiscaexistepas')).rejects.toThrow(
      "The package you were looking for doesn't exist."
    );
  });

  it('get the version list with non argument', async () => {
    await expect(getVersionList()).rejects.toThrow('Empty name given as argument');
  });
});

describe('resolveVersionRange', () => {
  it('rejects when package name is unparseable', async () => {
    await expect(resolveVersionRange('@@foo@zzz')).rejects.toThrow(
      'Unable to parse package name @@foo@zzz'
    );
  });

  it('simple package with no version', async () => {
    const version = await resolveVersionRange('whatever');
    expect(version).toEqual('whatever');
  });

  it('simple package with version not to be resolved', async () => {
    const version = await resolveVersionRange('whatever@2.2.2');
    expect(version).toEqual('whatever@2.2.2');
  });
  it('simple package which does not exist', async () => {
    expect(resolveVersionRange('publish-me-to-break-the-test')).rejects.toThrow(
      "The package you were looking for doesn't exist."
    );
  });

  it('simple package with version to be resolved but cant', async () => {
    await expect(resolveVersionRange('lodash@~2.2.2')).rejects.toThrow(
      "Specified version range '~2.2.2' is not resolvable"
    );
  });
  it('simple package with version to be resolved', async () => {
    const version = await resolveVersionRange('lodash@~4.16.4');
    expect(version).toEqual('lodash@4.16.6');
  });

  it('scoped package with no version', async () => {
    const version = await resolveVersionRange('@atlaskit/button');
    expect(version).toEqual('@atlaskit/button');
  });
  it('scoped package with version not to be resolved', async () => {
    const version = await resolveVersionRange('@atlaskit/button@10.1.2');
    expect(version).toEqual('@atlaskit/button@10.1.2');
  });
  it('scoped package which does not exist', async () => {
    await expect(resolveVersionRange('@atlaskit/publish-me-to-break-the-test')).rejects.toThrow(
      "The package you were looking for doesn't exist."
    );
  });
  it('scoped package with version to be resolved but cant', async () => {
    await expect(resolveVersionRange('@atlaskit/button@~2.2.2')).rejects.toThrow(
      "Specified version range '~2.2.2' is not resolvable"
    );
  });
  it('scoped package with version to be resolved', async () => {
    const version = await resolveVersionRange('@atlaskit/button@^1.0.0');
    expect(version).toEqual('@atlaskit/button@1.1.4');
  });
});
