const test = require('ava');
const _ = require('lodash/fp');
const {getVersionList, resolveVersionRange} = require('../../src/npm-utils');

test('getVersionList - get the version list of an existing package', async t => {
  const versionList = await getVersionList('lodash');
  t.true(versionList.length > 50);
  const expected = ['0.1.0', '0.2.0', '4.12.0', '4.16.4'];
  t.deepEqual(_.intersection(versionList, expected), expected);
});

test('getVersionList - get the version list of an unknown package', async t => {
  await t.throwsAsync(getVersionList('nonmaiscaexistepas'), {
    message: "The package you were looking for doesn't exist."
  });
});

test('getVersionList - get the version list with non argument', async t => {
  await t.throwsAsync(getVersionList(), {message: 'Empty name given as argument'});
});

test('resolveVersionRange - rejects when package name is unparseable', async t => {
  await t.throwsAsync(resolveVersionRange('@@foo@zzz'), {
    message: 'Unable to parse package name @@foo@zzz'
  });
});

test('resolveVersionRange - simple package with no version', async t => {
  const version = await resolveVersionRange('whatever');
  t.is(version, 'whatever');
});

test('resolveVersionRange - simple package with version not to be resolved', async t => {
  const version = await resolveVersionRange('whatever@2.2.2');
  t.is(version, 'whatever@2.2.2');
});
test('resolveVersionRange - simple package which does not exist', async t => {
  await t.throwsAsync(resolveVersionRange('publish-me-to-break-the-test'), {
    message: "The package you were looking for doesn't exist."
  });
});

test('resolveVersionRange - simple package with version to be resolved but cant', async t => {
  await t.throwsAsync(resolveVersionRange('lodash@~2.2.2'), {
    message: "Specified version range '~2.2.2' is not resolvable"
  });
});

test('resolveVersionRange - simple package with version to be resolved', async t => {
  const version = await resolveVersionRange('lodash@~4.16.4');
  t.is(version, 'lodash@4.16.6');
});

test('resolveVersionRange - scoped package with no version', async t => {
  const version = await resolveVersionRange('@atlaskit/button');
  t.is(version, '@atlaskit/button');
});

test('resolveVersionRange - scoped package with version not to be resolved', async t => {
  const version = await resolveVersionRange('@atlaskit/button@10.1.2');
  t.is(version, '@atlaskit/button@10.1.2');
});
test('resolveVersionRange - scoped package which does not exist', async t => {
  await t.throwsAsync(resolveVersionRange('@atlaskit/publish-me-to-break-the-test'), {
    message: "The package you were looking for doesn't exist."
  });
});
test('resolveVersionRange - scoped package with version to be resolved but cant', async t => {
  await t.throwsAsync(resolveVersionRange('@atlaskit/button@~2.2.2'), {
    message: "Specified version range '~2.2.2' is not resolvable"
  });
});
test('resolveVersionRange - scoped package with version to be resolved', async t => {
  const version = await resolveVersionRange('@atlaskit/button@^1.0.0');
  t.is(version, '@atlaskit/button@1.1.4');
});
