const yargs = require('yargs-parser');
const {npmOptionsFromArgv, getGlobalSizePredicate, getSizePredicate} = require('../../src/install');

const parse = cmd => yargs(cmd, {configuration: {'camel-case-expansion': false}});

describe('npmOptionsFromArgv', () => {
  it('no options', () => {
    expect(npmOptionsFromArgv(parse('toto titi toto'))).toEqual([]);
  });
  it('only bundle-phobia options', () => {
    expect(npmOptionsFromArgv(parse('-i --warn arg --interactive -w'))).toEqual([]);
  });
  it('only non bundle-phobia options', () => {
    expect(npmOptionsFromArgv(parse('-S --some-opt arg --quiet'))).toEqual([
      '-S',
      '--some-opt',
      'arg',
      '--quiet'
    ]);
  });
  it('mixed options options', () => {
    expect(npmOptionsFromArgv(parse('toto -S -i --some-opt arg -w'))).toEqual([
      '-S',
      '--some-opt',
      'arg'
    ]);
  });
});

describe('getSizePredicate', () => {
  it('returns a simple default doing nothing', () => {
    const predicate = getSizePredicate({}, '2kB', {});
    expect(predicate.description).toEqual('size limit of 2KB');
    expect(predicate.source).toEqual('default');
  });
  it('returns predicate request by argv', () => {
    const predicate = getSizePredicate({'max-size': '124kB'}, '2kB', {});
    expect(predicate.description).toEqual('size limit of 124KB');
    expect(predicate.source).toEqual('argv');
  });
  it('returns predicate request by argv', () => {
    const predicate = getSizePredicate({'max-gzip-size': '12kB'}, '2kB', {});
    expect(predicate.description).toEqual('gzip size limit of 12KB');
    expect(predicate.source).toEqual('argv');
  });
  it('returns predicate request by package.json', () => {
    const predicate = getSizePredicate({}, '2kB', {
      'bundle-phobia': {'max-size': '124kB'}
    });
    expect(predicate.description).toEqual('size limit of 124KB');
    expect(predicate.source).toEqual('package-config');
  });
  it('returns predicate request by package.json', () => {
    const predicate = getSizePredicate({}, '2kB', {
      'bundle-phobia': {'max-gzip-size': '12kB'}
    });
    expect(predicate.description).toEqual('gzip size limit of 12KB');
    expect(predicate.source).toEqual('package-config');
  });
});

describe('getGlobalSizePredicate', () => {
  it('returns a simple default doing nothing', () => {
    const predicate = getGlobalSizePredicate({}, {});
    expect(predicate.description).toBeUndefined();
  });
  it('returns predicate request by argv', () => {
    const predicate = getGlobalSizePredicate({'max-overall-size': '124kB'}, {});
    expect(predicate.description).toEqual('overall size limit of 124KB');
    expect(predicate.source).toEqual('argv');
  });
  it('returns predicate request by argv', () => {
    const predicate = getGlobalSizePredicate({'max-overall-gzip-size': '12kB'}, {});
    expect(predicate.description).toEqual('gzip size limit of 12KB');
    expect(predicate.source).toEqual('argv');
  });
  it('returns predicate request by package.json', () => {
    const predicate = getGlobalSizePredicate({}, {'bundle-phobia': {'max-overall-size': '124kB'}});
    expect(predicate.description).toEqual('overall size limit of 124KB');
    expect(predicate.source).toEqual('package-config');
  });
  it('returns predicate request by package.json', () => {
    const predicate = getGlobalSizePredicate(
      {},
      {'bundle-phobia': {'max-overall-gzip-size': '12kB'}}
    );
    expect(predicate.description).toEqual('gzip size limit of 12KB');
    expect(predicate.source).toEqual('package-config');
  });
});
