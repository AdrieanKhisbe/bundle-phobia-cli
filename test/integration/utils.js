const stripAnsi = require('strip-ansi');

const fakeStream = () => {
  const content = [];
  return {
    write(chunk) {
      content.push(chunk);
    },
    getContent() {
      return content.map(stripAnsi).join('');
    }
  };
};

const fakeExecFile = (statusCode = 0, stdout = '', stderr = '') => {
  let runCommand, runArgs;
  const execFile = (cmd, args, options, callback) => {
    runCommand = cmd;
    runArgs = args;
    const errorObject = statusCode !== 0 ? {code: statusCode} : null;
    callback(errorObject, stdout, stderr);
    return {};
  };
  Object.defineProperties(execFile, {
    invokedCmd: {get: () => runCommand},
    invokedArgs: {get: () => runArgs}
  });
  return execFile;
};
const fakePkg = () => ({dependencies: {ora: '^3.0.0'}});

const fakePrompt = (result = true) => {
  let sendArgs;
  const prompt = args => {
    sendArgs = args;
    return Promise.resolve({[args[0].name]: result});
  };
  prompt.retrieveArgs = () => sendArgs;
  return prompt;
};

module.exports = {fakeStream, fakeExecFile, fakePkg, fakePrompt};
