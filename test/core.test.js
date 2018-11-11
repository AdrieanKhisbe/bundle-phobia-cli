const {main} = require('../src/core');

describe('main', () => {
  it('fails when range is used with package list', () => {
    expect.assertions(1);
    const res = main({argv: {_: ['1', '2'], range: 3, r: 3}});
    return res.catch(err =>
      expect(err.message).toEqual("Can't use both --range option and list of packages")
    );
  });
  it('fails when --package is used with packages', () => {
    expect.assertions(1);
    const res = main({argv: {_: ['1'], package: 'package.json', p: 'package.json'}});
    return res.catch(err =>
      expect(err.message).toEqual("Can't use both --package option and list of packages")
    );
  });
  it('fails when package is used with packages', () => {
    expect.assertions(1);
    const res = main({argv: {_: ['1'], self: true}});
    return res.catch(err =>
      expect(err.message).toEqual("Can't use both --self and list of packages")
    );
  });
  it('fails when using multiple views', () => {
    expect.assertions(1);
    const res = main({argv: {_: ['lodash'], size: 'true', 'gzip-size': true}});
    return res.catch(err =>
      expect(err.message).toEqual("Can't use in the same time options size, gzip-size")
    );
  });
});
