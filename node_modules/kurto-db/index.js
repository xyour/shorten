var fs = require('fs');
var path = require('path');
var assert = require('assert');
var crypto = require('crypto');
var sqlite3 = require('sqlite3');

var dbPath = process.env.DBPATH || path.join(__dirname, '/db');
var db = new sqlite3.Database(dbPath);

function getScript(name) {
  var p = path.join(__dirname, 'sql', name + '.sql');
  return fs.readFileSync(p, { encoding: 'utf8' });
}

var sql = [
  'init',
  'add',
  'recent',
  'lookup',
  'increment',
  'clean'
].reduce(function(o, n) { o[n] = getScript(n); return o; }, {});

db.serialize(function() { db.run(sql.init); });

module.exports = {
  add: add,
  recent: recent,
  lookup: lookup,
  clean: clean,
  _db: db
};

function add(url, cb) {
  var id = shorten(url);
  var ts = Date.now();
  db.run(sql.add, { $id: id, $url: url, $ts: ts }, after);
  function after(err) {
    cb(err, err ? undefined : id);
  }
}

function shorten(url) {
  return crypto
    .createHash('sha1')
    .update(url)
    .digest('base64')
    .replace(/[=+/]/g, '')
    .slice(0, 6);
}

function recent(count, cb) {
  assert(typeof count === 'number', 'count must be a number');
  assert(count > 0, 'count must be bigger than zero');
  assert(Math.floor(count) === count, 'count must be an intiger');

  db.all(sql.recent, { $limit: count }, cb);
}

function lookup(id, cb) {
  db.serialize(function() {
    db.run(sql.increment, { $id: id });
    db.get(sql.lookup, { $id: id }, after);
  });
  function after(err, res) { cb(err, res && res.url); }
}

function clean(cb) {
  db.run(sql.clean, cb);
}

