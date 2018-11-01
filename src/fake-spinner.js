/* eslint-disable no-console, fp/no-class */
class fakeSpinner {
  constructor(message) {
    this.message;
  }

  info(message) {
    console.log(message);
    return this;
  }

  warn(message) {
    console.log(message);
    return this;
  }

  succeed(message) {
    console.log(message);
    return this;
  }

  fail(message) {
    console.log(message);
    return this;
  }

  stopAndPersist() {
    return this;
  }

  start() {
    return this;
  }

  stop() {
    return this;
  }

  clear() {
    return this;
  }
}

module.exports = (...args) => new fakeSpinner(...args);
