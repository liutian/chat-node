
/**
 * Module dependencies.
 */

var http = require('http'),
	express = require('./src/app/express'),
	socketIO = require('./src/app/socket.io');


var server = http.createServer(express);
server.listen(express.get('port'), function(){
	console.log('Express server start running ');
});
socketIO(server);
