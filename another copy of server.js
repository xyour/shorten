
var express = require('express');
var db = require('kurto-db');

var app = express();

var idNum = 6;

var shortens = [
	{ id:'id1', url:'www.google.es', count:0 },
	{ id:'id2', url:'www.google.pt', count:0 },
	{ id:'id3', url:'www.google.co.uk', count:0 },
	{ id:'id4', url:'www.google.br', count:0 },
	{ id:'id5', url:'www.google.it', count:0 }
]

app.use( express.urlencoded() );

app.get('/', function(req, res){
	// get 10 most recent urls
	db.recent(10, function(err, recent) {
		if (err) throw err;
		console.log(recent); // [ { id: '3wfEKt', url: 'http://example.org', count: 0 } ]
		res.send(recent);
	});
});

//curl localhost:8000/aaa
app.get('/:url', function(req, res){
	var parm = req.params['url'];
	
	var link = '';
	for (var i=0; i<shortens.length; i++){
		if (shortens[i].id == parm){
			link = shortens[i].url;
			break;
		}
	}
	console.log(link);
	if (link != ''){
		res.redirect('http://' + link);
		shortens[i].count++;
	}
	// console.log(req.params);
	res.send('url: ' + link);
});

//curl localhost:8000 -i -X POST -d 'a=b'
app.post('/', function(req, res){
	if(req.body.hasOwnProperty('url')){
		var shorten = {
			id: 'id' + idNum++, 
			url: req.body['url'], 
			count: 0
		};
		shortens.push(shorten);
		console.log('ok');
		res.send(req.body);
	}
	else{
		console.log('invalid');
		res.send('Invalid shorten');
	}
});

app.listen(8000);


