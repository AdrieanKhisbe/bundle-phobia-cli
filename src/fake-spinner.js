class fakeSpinner {
  constructor(options) {
    const {text, stream} = options;
    this.text = text || options;
    this.stream = stream || process.stdout;
    this.fail = this.log;
    this.succeed = this.log;
    this.info = this.log;
    this.warn = this.log;
  }

  log(message) {
    this.stream.write(message.toString());
    this.stream.write('\n');
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
