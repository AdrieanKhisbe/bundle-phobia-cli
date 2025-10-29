import stripAnsi from 'strip-ansi';

const stripKb = (str, pattern = 'XXX') => str.replace(/[\d.]+KB/g, `${pattern}KB`);

const fakeStream = () => {
  const content = [];
  return {
    write(chunk) {
      content.push(chunk);
    },
    getContent({stripKbSizes = false} = {}) {
      const raw = content.map(stripAnsi).join('');
      return stripKbSizes ? stripKb(raw) : raw;
    }
  };
};

const fakeSpawn = (statusCode = 0, stdout = '', stderr = '') => {
  let runCommand, runArgs;
  const spawn = (cmd, args, options, callback) => {
    runCommand = cmd;
    runArgs = args;
    const errorObject = statusCode !== 0 ? {code: statusCode} : null;
    callback(errorObject, stdout, stderr);
  };
  Object.defineProperties(spawn, {
    invokedCmd: {get: () => runCommand},
    invokedArgs: {get: () => runArgs}
  });
  return spawn;
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

export {stripKb, fakeStream, fakeSpawn, fakePkg, fakePrompt};
