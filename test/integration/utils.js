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
    return Promise.resolve({[args[0].name]: result});
  };
  prompt.retrieveArgs = () => sendArgs;
  return prompt;
};

module.exports = {fakeStream, fakeExec, fakePkg, fakePrompt};
