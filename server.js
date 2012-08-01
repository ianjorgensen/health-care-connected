var server = require('router').create();
var _ = require('underscore');
var common = require('common');
var file = require('./lib/file').file;

var data = require('./lib/dummy');
var diabcu = require('./lib/diabcu');

var port = process.argv[2] || 9000;

server.get('/', file('./slides.html'));
server.get('/js/{*}', file('./js/{*}'));
server.get('/img/{*}', file('./img/{*}'));
server.get('/256/{*}', file('./256/{*}'));
server.get('/128/{*}', file('./128/{*}'));
server.get('/readings', function(request, response) {
	var readings = diabcu.load(data.mail, request.query);

	response.writeHead(200, {'content-type':'application/json'});
	response.end((request.query.callback || 'callback') + '(' + JSON.stringify(readings, null, '\t') +');');
});

server.all('*', function(request, response) {
	response.writeHead(404);
	response.end('404');
});

server.listen(port);

console.log('server running on port',port);

process.on('uncaughtException', function(err) { console.log(err.stack) });