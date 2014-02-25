# kurto-db

usage:

```js
var db = require('kurto-db');

// add an url
db.add('http://example.org', function(err, id) {
  if (err) throw err;
  console.log(id); // '3wfEKt'
});

// get 2 most recent urls
db.recent(2, function(err, recent) {
  if (err) throw err;
  console.log(recent); // [ { id: '3wfEKt', url: 'http://example.org', count: 0 } ]
})

// lookup an url, if found increments its count
db.lookup('3wfEKt', function(err, recent) {
  if (err) throw err;
  console.log(url); // 'http://example.org'
});
```

