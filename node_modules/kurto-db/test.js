var assert = require('assert');
var util = require('util');

var tests = [];
function test(name, testFn) {
  tests.push({ n: name, f: testFn });
}

function run() {
  var t = tests.shift();
  if (! t)
    return console.log('=== OK ===');

  console.log('++', t.n);
  t.f(after);

  function after(err) {
    assert.ifError(err);
    setImmediate(run);
  }
}

setImmediate(run);

var path = require('path');
var db;

test('use test db', function(cb) {
  process.env.DBPATH = path.join(__dirname, 'testdb');
  db = require('./');
  cb();
});

test('cleanup db', function(cb) {
  db.clean(cb);
});

test('recent should be empty', function(cb) {
  db.recent(100, function(err, recent) {
    if (err) return cb(err);
    assert(util.isArray(recent), 'recent is not an array');
    assert.equal(recent.length, 0, 'database is not really empty');
    cb();
  });
});

var urls = [
  'http://example.org',
  'http://wikipedia.org',
  'http://kernel.org',
  'http://freebsd.org'
];
var firstId;
urls.forEach(function(url) {
  test('add \'' + url + '\'', function(cb) {
    db.add(url, function(err, id) {
      if (err) return cb(err);
      assert(id, 'id is always provided for an added url');
      if (! firstId) firstId = id;
      // wait some time before adding the next to ensure the correct order
      setTimeout(cb, 2);
    });
  });
});

var firstUrl = urls[0];
test('add \'' + firstUrl + '\' again', function(cb) {
  db.add(firstUrl, function(err, id) {
    if (err) return cb(err);
    assert.equal(id, firstId, 'an url should always have the same id');
    cb();
  });
});

test('recent works correctly', function(cb) {
  var count = 2;
  db.recent(count, function(err, recent) {
    if (err) return cb(err);
    assert(util.isArray(recent), 'recent is not an array');
    assert.equal(recent.length, count, 'wrong count in recent');
    assert.equal(recent[0].url, firstUrl,
      'last url added should be the most recent');
    assert.equal(recent[1].url, urls[urls.length - 1],
      'second to last url added should be second most recent');
    cb();
  });
});

test('lookup the first added url', function(cb) {
  db.lookup(firstId, function(err, url) {
    if (err) return cb(err);
    assert.equal(url, firstUrl, 'wrong url');
    cb();
  });
});

test('lookup inexistent', function(cb) {
  db.lookup(Math.random().toString(), function(err, url) {
    if (err) return err;
    assert.equal(url, undefined, 'no url should be found');
    cb();
  });
});

test('first added url count has incremented', function(cb) {
  db.recent(1, function(err, recent) {
    if (err) return cb(err);
    assert(util.isArray(recent), 'recent is not an array');
    assert.equal(recent.length, 1, 'wrong number of results');
    assert.equal(recent[0].url, firstUrl, 'incorrect entry returned');
    assert.equal(recent[0].count, 1, 'incorrect entry count value');
    cb();
  });
});

