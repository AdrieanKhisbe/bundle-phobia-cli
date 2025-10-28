import test from 'ava';
import {
  sizePredicate,
  gzipSizePredicate,
  globalSizePredicate,
  globalGzipSizePredicate
} from '../../src/install-predicates.js';

const smallStats = {size: 1000, gzip: 100};
const bigStats = {size: 100000, gzip: 10000};

test('sizePredicate - can be created with an integer value', t => {
  const predicate = sizePredicate(1234);
  t.deepEqual(predicate.threshold, 1234);
});

test('sizePredicate - can be created with an bytes value', t => {
  const predicate = sizePredicate('10kB');
  t.deepEqual(predicate.threshold, 10240);
});

test('sizePredicate - detect value violating threshold', t => {
  const predicate = sizePredicate('10kB');
  t.deepEqual(predicate(bigStats), {
    canInstall: false,
    details: '97.66KB > 10KB',
    reason: 'size over threshold'
  });
});

test('sizePredicate - detect value respecting threshold', t => {
  const predicate = sizePredicate('10kB');
  t.deepEqual(predicate(smallStats), {canInstall: true});
});

test('gzipSizePredicate - gzipSizePredicate - can be created with an integer value', t => {
  const predicate = gzipSizePredicate(1234);
  t.deepEqual(predicate.threshold, 1234);
});

test('gzipSizePredicate - can be created with an bytes value', t => {
  const predicate = gzipSizePredicate('10kB');
  t.deepEqual(predicate.threshold, 10240);
});

test('gzipSizePredicate - detect value violating threshold', t => {
  const predicate = gzipSizePredicate('1kB');
  t.deepEqual(predicate(bigStats), {
    canInstall: false,
    details: '9.77KB > 1KB',
    reason: 'gzip size over threshold'
  });
});

test('gzipSizePredicate - detect value respecting threshold', t => {
  const predicate = gzipSizePredicate('1kB');
  t.deepEqual(predicate(smallStats), {canInstall: true});
});

test('globalSizePredicate - can be created with an integer value', t => {
  const predicate = globalSizePredicate(1234);
  t.deepEqual(predicate.threshold, 1234);
});

test('globalSizePredicate - can be created with an bytes value', t => {
  const predicate = globalSizePredicate('10kB');
  t.deepEqual(predicate.threshold, 10240);
});

test('globalSizePredicate - detect value violating threshold', t => {
  const predicate = globalSizePredicate('1kB');
  t.deepEqual(predicate(bigStats, bigStats), {
    canInstall: false,
    details: '97.66KB installed + 97.66KB > 1KB',
    reason: 'overall size after install would be over threshold'
  });
});

test('globalSizePredicate - detect value respecting threshold', t => {
  const predicate = globalSizePredicate('2.1kB');
  t.deepEqual(predicate(smallStats, smallStats), {canInstall: true});
});

test('globalGzipSizePredicate - can be created with an integer value', t => {
  const predicate = globalGzipSizePredicate(1234);
  t.deepEqual(predicate.threshold, 1234);
});

test('globalGzipSizePredicate - can be created with an bytes value', t => {
  const predicate = globalGzipSizePredicate('10kB');
  t.deepEqual(predicate.threshold, 10240);
});

test('globalGzipSizePredicate - detect value violating threshold', t => {
  const predicate = globalGzipSizePredicate('1kB');
  t.deepEqual(predicate(bigStats, bigStats), {
    canInstall: false,
    details: '9.77KB installed + 9.77KB > 1KB',
    reason: 'overall gzip size after install would be over threshold'
  });
});

test('globalGzipSizePredicate - detect value respecting threshold', t => {
  const predicate = globalGzipSizePredicate('2.1kB');
  t.deepEqual(predicate(smallStats, smallStats), {canInstall: true});
});
