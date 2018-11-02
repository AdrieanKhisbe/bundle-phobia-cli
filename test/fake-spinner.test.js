/* eslint-disable fp/no-loops */
const fakeSpinner = require('../src/fake-spinner');

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
    const spinner = fakeSpinner('test');
    for (const method of ['info', 'succeed', 'fail', 'warn']) {
      expect(spinner[method](method)).toBe(spinner);
    }
  });
});
