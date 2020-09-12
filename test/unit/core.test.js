const test = require('ava');
const {main} = require('../../src/core');

test('fails when range is used with package list', async t => {
  await t.throwsAsync(main({argv: {_: ['1', '2'], range: 3, r: 3}}), {
    message: "Can't use both --range option and list of packages"
  });
});

test('fails when --package is used with packages', async t => {
  await t.throwsAsync(main({argv: {_: ['1'], package: 'package.json', p: 'package.json'}}), {
    message: "Can't use both --package option and list of packages"
  });
});

test('fails when package is used with packages', async t => {
  await t.throwsAsync(main({argv: {_: ['1'], self: true}}), {
    message: "Can't use both --self and list of packages"
  });
});

test('fails when using multiple views', async t => {
  await t.throwsAsync(main({argv: {_: ['lodash'], size: 'true', 'gzip-size': true}}), {
    message: "Can't use in the same time options gzip-size, size"
  });
});
