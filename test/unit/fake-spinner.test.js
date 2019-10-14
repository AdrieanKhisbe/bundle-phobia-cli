const fakeSpinner = require('../../src/fake-spinner');

describe('fake-spinner', () => {
  it('should be instantied with an initial message', () => {
    const spinner = fakeSpinner('test');
    expect(spinner.text).toEqual('test');
  });
  it('methods returns the instance', () => {
    const spinner = fakeSpinner('test');
    for (const method of ['clear', 'start', 'stop', 'stopAndPersist']) {
      expect(spinner[method]()).toBe(spinner);
    }
  });
  it('methods logging method just log returns the instance', () => {
    const loggingMethods = ['info', 'succeed', 'fail', 'warn'];
    let ncall = 0;
    const testGenerator = (function*() {
      for (const method of loggingMethods) {
        expect(yield).toEqual(method);
        expect(yield).toEqual('\n');
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
      expect(spinner[method](method)).toBe(spinner);
    }
    expect(ncall).toBe(loggingMethods.length);
  });
});
