const test = require('ava');
const {main} = require('../../src/install');
const {fakeStream, fakeExecFile, fakePkg, fakePrompt} = require('./utils');

const defaultMaxSize = 10000;

test('install just a single package and fail', async t => {
  const stream = fakeStream();
  const execFile = fakeExecFile();
  try {
    await main({
      argv: {_: ['lodash@4.12.0']},
      stream,
      execFile,
      defaultMaxSize,
      readPkg: fakePkg
    });
    throw new Error('Did not fail as execFileted');
  } catch (err) {
    t.is(err.message, 'Install was canceled.');
    t.is(
      stream.getContent(),
      `ℹ Applying a size limit of 9.77KB from default

- Fetching stats for package lodash@4.12.0
✖ Could not install for following reasons:
✖ lodash@4.12.0: size over threshold (63.65KB > 9.77KB)
✔ global constraint is respected
`
    );
  }
});

test('install just a single package and succeed', async t => {
  const stream = fakeStream();
  const execFile = fakeExecFile();
  //
  await main({
    argv: {_: ['bytes@3.0.0']},
    stream,
    execFile,
    defaultMaxSize,
    readPkg: fakePkg
  });

  t.is(
    stream.getContent(),
    `ℹ Applying a size limit of 9.77KB from default

- Fetching stats for package bytes@3.0.0
ℹ Proceed to installation of package bytes@3.0.0
`
  );
  t.is(execFile.invokedCmd, 'npm');
  t.deepEqual(execFile.invokedArgs, ['install', 'bytes@3.0.0']);
});

test('install just a single package and just warn', async t => {
  const stream = fakeStream();
  const execFile = fakeExecFile();
  await main({
    argv: {_: ['lodash@4.12.0'], w: true, warn: true, 'save-dev': true},
    stream,
    execFile,
    defaultMaxSize,
    readPkg: fakePkg
  });

  t.is(
    stream.getContent(),
    `ℹ Applying a size limit of 9.77KB from default

- Fetching stats for package lodash@4.12.0
⚠ Proceed to installation of packages lodash@4.12.0 despite following warnings:
⚠ lodash@4.12.0: size over threshold (63.65KB > 9.77KB)
`
  );
  t.is(execFile.invokedCmd, 'npm');
  t.deepEqual(execFile.invokedArgs, ['install', 'lodash@4.12.0', '--save-dev']);
});

test('ask to install a package and accept', async t => {
  const stream = fakeStream();
  const execFile = fakeExecFile();
  const prompt = fakePrompt();
  await main({
    argv: {_: ['lodash@4.12.0'], i: true, interactive: true},
    stream,
    execFile,
    prompt,
    defaultMaxSize,
    readPkg: fakePkg
  });
  t.is(
    stream.getContent(),
    `ℹ Applying a size limit of 9.77KB from default

- Fetching stats for package lodash@4.12.0
⚠ Packages lodash@4.12.0 raised following warnings:
⚠ lodash@4.12.0: size over threshold (63.65KB > 9.77KB)
✔ Proceeding with installation as you requested
`
  );
  t.is(execFile.invokedCmd, 'npm');
  t.deepEqual(execFile.invokedArgs, ['install', 'lodash@4.12.0']);
});
test('ask to install a package and deny', async t => {
  const stream = fakeStream();
  const execFile = fakeExecFile();
  const prompt = fakePrompt(false);
  await main({
    argv: {_: ['lodash@4.12.0'], i: true, interactive: true},
    stream,
    execFile,
    prompt,
    defaultMaxSize,
    readPkg: fakePkg
  });

  t.is(
    stream.getContent(),
    `ℹ Applying a size limit of 9.77KB from default

- Fetching stats for package lodash@4.12.0
⚠ Packages lodash@4.12.0 raised following warnings:
⚠ lodash@4.12.0: size over threshold (63.65KB > 9.77KB)
✖ Installation is canceled on your demand
`
  );
  t.is(execFile.invokedCmd, undefined);
});

test('try to install package that does not exist', async t => {
  const stream = fakeStream();
  const execFile = fakeExecFile();
  try {
    await main({
      argv: {_: ['no-sorry-but-i-do-not-exist']},
      stream,
      execFile,
      defaultMaxSize,
      readPkg: fakePkg
    });

    throw new Error('Exception was not triggered');
  } catch (err) {
    t.is(
      err.message,
      "no-sorry-but-i-do-not-exist: The package you were looking for doesn't exist."
    );
  }
});

test('install just a single package on empty package with global config and succeed', async t => {
  const stream = fakeStream();
  const execFile = fakeExecFile();

  await main({
    argv: {_: ['bytes@3.0.0']},
    stream,
    execFile,
    defaultMaxSize,
    readPkg: () => ({
      dependencies: {},
      'bundle-phobia': {
        'max-size': '20kB',
        'max-overall-size': '50kB'
      }
    })
  });

  t.is(
    stream.getContent(),
    `ℹ Applying a size limit of 20KB from package-config and overall size limit of 50KB from package-config

- Fetching stats for package bytes@3.0.0
ℹ Proceed to installation of package bytes@3.0.0
`
  );
  t.is(execFile.invokedCmd, 'npm');
  t.deepEqual(execFile.invokedArgs, ['install', 'bytes@3.0.0']);
});
