const {main} = require('../src/core');

describe('main', () => {
  it('fails when range is used with package list', async () => {
    await expect(main({argv: {_: ['1', '2'], range: 3, r: 3}})).rejects.toThrow(
      "Can't use both --range option and list of packages"
    );
  });

  it('fails when --package is used with packages', async () => {
    await expect(
      main({argv: {_: ['1'], package: 'package.json', p: 'package.json'}})
    ).rejects.toThrow("Can't use both --package option and list of packages");
  });

  it('fails when package is used with packages', async () => {
    await expect(main({argv: {_: ['1'], self: true}})).rejects.toThrow(
      "Can't use both --self and list of packages"
    );
  });

  it('fails when using multiple views', async () => {
    await expect(main({argv: {_: ['lodash'], size: 'true', 'gzip-size': true}})).rejects.toThrow(
      "Can't use in the same time options gzip-size, size"
    );
  });
});
