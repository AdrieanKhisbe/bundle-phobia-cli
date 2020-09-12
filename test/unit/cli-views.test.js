const test = require('ava');
const stripAnsi = require('strip-ansi');
const {
  getView,
  syntheticView,
  jsonView,
  sizeView,
  gzipsizeView,
  dependenciesView
} = require('../../src/cli-views');
const {lodashStats} = require('./fixtures');

test('syntheticView basic lodash stats', t => {
  const lodashView = stripAnsi(syntheticView(lodashStats));
  t.is(lodashView, 'lodash (4.17.4) has 0 dependencies for a weight of 69.21KB (24.09KB gzipped)');
});

test('sizeView', t => {
  t.is(sizeView(lodashStats), 70870);
});
test('gzipsizeView', t => {
  t.is(gzipsizeView(lodashStats), 24666);
});
test('dependenciesView', t => {
  t.is(dependenciesView(lodashStats), 0);
});

test('getView - retrieve synthetic view by default', t => {
  t.is(getView(), syntheticView);
});

test('getView - retrieve size view on demand', t => {
  t.is(getView({size: true}), sizeView);
});

test('getView - retrieve gzip size view on demand', t => {
  t.is(getView({'gzip-size': true}), gzipsizeView);
});

test('getView - retrieve dependencies view on demand', t => {
  t.is(getView({dependencies: true}), dependenciesView);
});

test('getView - retrieve json view on demand', t => {
  t.is(getView({json: true}), jsonView);
});

test('getView - throw erreur when multiple args', t => {
  t.throws(() => getView({json: true, size: true}));
});
