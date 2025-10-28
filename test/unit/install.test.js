const test = require('ava');
const yargs = require('yargs-parser');
const {
  npmOptionsFromArgv,
  getGlobalSizePredicate,
  getSizePredicate,
  readCurrentPackage
} = require('../../src/install');

const parse = cmd => yargs(cmd, {configuration: {'camel-case-expansion': false}});

test('npmOptionsFromArgv - no options', t => {
  t.deepEqual(npmOptionsFromArgv(parse('toto titi toto')), []);
});

test('npmOptionsFromArgv - only bundle-phobia options', t => {
  t.deepEqual(npmOptionsFromArgv(parse('-i --warn arg --interactive -w')), []);
});

test('npmOptionsFromArgv - only non bundle-phobia options', t => {
  t.deepEqual(npmOptionsFromArgv(parse('-S --some-opt arg --quiet')), [
    '-S',
    '--some-opt',
    'arg',
    '--quiet'
  ]);
});

test('npmOptionsFromArgv - mixed options options', t => {
  t.deepEqual(npmOptionsFromArgv(parse('toto -S -i --some-opt arg -w')), [
    '-S',
    '--some-opt',
    'arg'
  ]);
});

test('getSizePredicate - returns a simple default doing nothing', t => {
  const predicate = getSizePredicate({}, '2kB', {});
  t.deepEqual(predicate.description, 'size limit of 2KB');
  t.deepEqual(predicate.source, 'default');
});

test('getSizePredicate - returns predicate request by argv', t => {
  const predicate = getSizePredicate({'max-size': '124kB'}, '2kB', {});
  t.deepEqual(predicate.description, 'size limit of 124KB');
  t.deepEqual(predicate.source, 'argv');
});

test('getSizePredicate - returns gzip predicate request by argv', t => {
  const predicate = getSizePredicate({'max-gzip-size': '12kB'}, '2kB', {});
  t.deepEqual(predicate.description, 'gzip size limit of 12KB');
  t.deepEqual(predicate.source, 'argv');
});

test('getSizePredicate - returns predicate request by package.json', t => {
  const predicate = getSizePredicate({}, '2kB', {
    'bundle-phobia': {'max-size': '124kB'}
  });
  t.deepEqual(predicate.description, 'size limit of 124KB');
  t.deepEqual(predicate.source, 'package-config');
});

test('getSizePredicate - returns gzip predicate request by package.json', t => {
  const predicate = getSizePredicate({}, '2kB', {
    'bundle-phobia': {'max-gzip-size': '12kB'}
  });
  t.deepEqual(predicate.description, 'gzip size limit of 12KB');
  t.deepEqual(predicate.source, 'package-config');
});

test('getGlobalSizePredicate - returns a simple default doing nothing', t => {
  const predicate = getGlobalSizePredicate({}, {});
  t.is(predicate.description, undefined);
});

test('getGlobalSizePredicate - returns predicate request by argv', t => {
  const predicate = getGlobalSizePredicate({'max-overall-size': '124kB'}, {});
  t.deepEqual(predicate.description, 'overall size limit of 124KB');
  t.deepEqual(predicate.source, 'argv');
});

test('getGlobalSizePredicate - returns gzip predicate request by argv', t => {
  const predicate = getGlobalSizePredicate({'max-overall-gzip-size': '12kB'}, {});
  t.deepEqual(predicate.description, 'gzip size limit of 12KB');
  t.deepEqual(predicate.source, 'argv');
});

test('getGlobalSizePredicate - returns predicate request by package.json', t => {
  const predicate = getGlobalSizePredicate({}, {'bundle-phobia': {'max-overall-size': '124kB'}});
  t.deepEqual(predicate.description, 'overall size limit of 124KB');
  t.deepEqual(predicate.source, 'package-config');
});

test('getGlobalSizePredicate -returns predicate request by package.json', t => {
  const predicate = getGlobalSizePredicate(
    {},
    {'bundle-phobia': {'max-overall-gzip-size': '12kB'}}
  );
  t.deepEqual(predicate.description, 'gzip size limit of 12KB');
  t.deepEqual(predicate.source, 'package-config');
});

test('readCurrentPackage', t => {
  const pkg = readCurrentPackage();
  t.is(pkg.name, 'bundle-phobia-cli');
  t.is(pkg.description, 'Cli for the node BundlePhobia Service');
});
