const {
  sizePredicate,
  gzipSizePredicate,
  globalSizePredicate,
  globalGzipSizePredicate
} = require('../../src/install-predicates');

const smallStats = {
  size: 1000,
  gzip: 100
};
const bigStats = {
  size: 100000,
  gzip: 10000
};

describe('sizePredicate', () => {
  it('can be created with an integer value', () => {
    const predicate = sizePredicate(1234);
    expect(predicate.threshold).toEqual(1234);
  });
  it('can be created with an bytes value', () => {
    const predicate = sizePredicate('10kB');
    expect(predicate.threshold).toEqual(10240);
  });
  it('detect value violating threshold', () => {
    const predicate = sizePredicate('10kB');
    expect(predicate(bigStats)).toEqual({
      canInstall: false,
      details: '97.66KB > 10KB',
      reason: 'size over threshold'
    });
  });
  it('detect value respecting threshold', () => {
    const predicate = sizePredicate('10kB');
    expect(predicate(smallStats)).toEqual({canInstall: true});
  });
});

describe('gzipSizePredicate', () => {
  it('can be created with an integer value', () => {
    const predicate = gzipSizePredicate(1234);
    expect(predicate.threshold).toEqual(1234);
  });
  it('can be created with an bytes value', () => {
    const predicate = gzipSizePredicate('10kB');
    expect(predicate.threshold).toEqual(10240);
  });
  it('detect value violating threshold', () => {
    const predicate = gzipSizePredicate('1kB');
    expect(predicate(bigStats)).toEqual({
      canInstall: false,
      details: '9.77KB > 1KB',
      reason: 'gzip size over threshold'
    });
  });
  it('detect value respecting threshold', () => {
    const predicate = gzipSizePredicate('1kB');
    expect(predicate(smallStats)).toEqual({canInstall: true});
  });
});

describe('globalSizePredicate', () => {
  it('can be created with an integer value', () => {
    const predicate = globalSizePredicate(1234);
    expect(predicate.threshold).toEqual(1234);
  });
  it('can be created with an bytes value', () => {
    const predicate = globalSizePredicate('10kB');
    expect(predicate.threshold).toEqual(10240);
  });
  it('detect value violating threshold', () => {
    const predicate = globalSizePredicate('1kB');
    expect(predicate(bigStats, bigStats)).toEqual({
      canInstall: false,
      details: '97.66KB installed + 97.66KB > 1KB',
      reason: 'overall size after install would be over threshold'
    });
  });
  it('detect value respecting threshold', () => {
    const predicate = globalSizePredicate('2.1kB');
    expect(predicate(smallStats, smallStats)).toEqual({canInstall: true});
  });
});
describe('globalGzipSizePredicate', () => {
  it('can be created with an integer value', () => {
    const predicate = globalGzipSizePredicate(1234);
    expect(predicate.threshold).toEqual(1234);
  });
  it('can be created with an bytes value', () => {
    const predicate = globalGzipSizePredicate('10kB');
    expect(predicate.threshold).toEqual(10240);
  });
  it('detect value violating threshold', () => {
    const predicate = globalGzipSizePredicate('1kB');
    expect(predicate(bigStats, bigStats)).toEqual({
      canInstall: false,
      details: '9.77KB installed + 9.77KB > 1KB',
      reason: 'overall gzip size after install would be over threshold'
    });
  });
  it('detect value respecting threshold', () => {
    const predicate = globalGzipSizePredicate('2.1kB');
    expect(predicate(smallStats, smallStats)).toEqual({canInstall: true});
  });
});
