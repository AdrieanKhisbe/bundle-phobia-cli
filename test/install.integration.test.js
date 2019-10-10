const stripAnsi = require('strip-ansi');
const Bromise = require('bluebird');
const {main} = require('../src/install');

const fakeStream = () => {
  const content = [];
  return {
    write(chunk) {
      content.push(chunk);
    },
    getContent() {
      return content.join('');
    }
  };
};
const fakeExec = (statusCode = 0) => {
  let runCommand;
  const exec = cmd => {
    runCommand = cmd;
    return {code: statusCode};
  };
  exec.retrieveCmd = () => runCommand;
  return exec;
};
const fakePkg = () => ({dependencies: {ora: '^3.0.0'}});

const fakePrompt = (result = true) => {
  let sendArgs;
  const prompt = args => {
    sendArgs = args;
    return Bromise.resolve({[args[0].name]: result});
  };
  prompt.retrieveArgs = () => sendArgs;
  return prompt;
};

const defaultMaxSize = 10000;
describe('Integrations tests', () => {
  it('install just a single package and fail', async () => {
    const stream = fakeStream();
    const exec = fakeExec();
    //
    try {
      await main({
        argv: {_: ['lodash@4.12.0']},
        stream,
        exec,
        defaultMaxSize,
        readPkg: fakePkg
      });
      throw new Error('Did not fail as exected');
    } catch (err) {
      expect(err.message).toEqual('Install was canceled.');
      const output = stream.getContent();
      expect(stripAnsi(output)).toEqual(
        `ℹ Applying a size limit of 9.77KB from default

- Fetching stats for package lodash@4.12.0
✖ Could not install for following reasons:
✖ lodash@4.12.0: size over threshold (63.65KB > 9.77KB)
✔ global constraint is respected
`
      );
    }
  });
  it('install just a single package and succeed', async () => {
    const stream = fakeStream();
    const exec = fakeExec();
    //
    await main({
      argv: {_: ['bytes@3.0.0']},
      stream,
      exec,
      defaultMaxSize,
      readPkg: fakePkg
    });

    const output = stream.getContent();
    expect(stripAnsi(output)).toEqual(
      `ℹ Applying a size limit of 9.77KB from default

- Fetching stats for package bytes@3.0.0
ℹ Proceed to installation of package bytes@3.0.0
`
    );
    expect(exec.retrieveCmd()).toEqual('npm install bytes@3.0.0');
  });
  it('install just a single package and just warn', async () => {
    const stream = fakeStream();
    const exec = fakeExec();
    //
    await main({
      argv: {_: ['lodash@4.12.0'], w: true, warn: true, 'save-dev': true},
      stream,
      exec,
      defaultMaxSize,
      readPkg: fakePkg
    });

    const output = stream.getContent();
    expect(stripAnsi(output)).toEqual(
      `ℹ Applying a size limit of 9.77KB from default

- Fetching stats for package lodash@4.12.0
⚠ Proceed to installation of packages lodash@4.12.0 despite following warnings:
⚠ lodash@4.12.0: size over threshold (63.65KB > 9.77KB)
`
    );
    expect(exec.retrieveCmd()).toEqual('npm install lodash@4.12.0 --save-dev');
  });

  it('ask to install a package and accept', async () => {
    const stream = fakeStream();
    const exec = fakeExec();
    const prompt = fakePrompt();
    //
    await main({
      argv: {_: ['lodash@4.12.0'], i: true, interactive: true},
      stream,
      exec,
      prompt,
      defaultMaxSize,
      readPkg: fakePkg
    });
    const output = stream.getContent();
    expect(stripAnsi(output)).toEqual(
      `ℹ Applying a size limit of 9.77KB from default

- Fetching stats for package lodash@4.12.0
⚠ Packages lodash@4.12.0 raised following warnings:
⚠ lodash@4.12.0: size over threshold (63.65KB > 9.77KB)
✔ Proceeding with installation as you requested
`
    );
    expect(exec.retrieveCmd()).toEqual('npm install lodash@4.12.0');
  });
  it('ask to install a package and deny', async () => {
    const stream = fakeStream();
    const exec = fakeExec();
    const prompt = fakePrompt(false);
    //
    await main({
      argv: {_: ['lodash@4.12.0'], i: true, interactive: true},
      stream,
      exec,
      prompt,
      defaultMaxSize,
      readPkg: fakePkg
    });

    const output = stream.getContent();
    expect(stripAnsi(output)).toEqual(
      `ℹ Applying a size limit of 9.77KB from default

- Fetching stats for package lodash@4.12.0
⚠ Packages lodash@4.12.0 raised following warnings:
⚠ lodash@4.12.0: size over threshold (63.65KB > 9.77KB)
✖ Installation is canceled on your demand
`
    );
    expect(exec.retrieveCmd()).toBeUndefined();
  });

  it('try to install package that does not exist', async () => {
    const stream = fakeStream();
    const exec = fakeExec();
    try {
      await main({
        argv: {_: ['no-sorry-but-i-do-not-exist']},
        stream,
        exec,
        defaultMaxSize,
        readPkg: fakePkg
      });

      throw new Error('Exception was not triggered');
    } catch (err) {
      expect(err.message).toEqual(
        "no-sorry-but-i-do-not-exist: The package you were looking for doesn't exist."
      );
    }
  });
});
