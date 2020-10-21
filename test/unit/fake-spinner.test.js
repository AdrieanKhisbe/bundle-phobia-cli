const test = require('ava');
const fakeSpinner = require('../../src/fake-spinner');

test('should be instantied with an initial message', t => {
  const spinner = fakeSpinner('test');
  t.is(spinner.text, 'test');
});

test('methods returns the instance', t => {
  const spinner = fakeSpinner('test');
  for (const method of ['clear', 'start', 'stop', 'stopAndPersist']) {
    t.is(spinner[method](), spinner);
  }
});

test('methods logging method just log returns the instance', t => {
  const loggingMethods = ['info', 'succeed', 'fail', 'warn'];
  let ncall = 0;
  const testGenerator = (function* () {
    for (const method of loggingMethods) {
      t.is(yield, method);
      t.is(yield, '\n');
      ncall++;
    }
  })();
  testGenerator.next();
  const fakeStream = {
    write(content) {
      testGenerator.next(content);
    }
  };
  const spinner = fakeSpinner({text: 'test', stream: fakeStream});
  for (const method of loggingMethods) {
    t.is(spinner[method](method), spinner);
  }
  t.is(ncall, loggingMethods.length);
});
