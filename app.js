process.env.NODE_ENV = 'development';
/**
 * Module dependencies.
 */
require('./src/prop.js');

require('./src/log')({
	dir : __dirname + '/log/',
	level : process.env.NODE_ENV != 'development' ? 'ERROR' : ''
});

var http = require('http'),
	express = require('./src/app/express'),
	log4js = require('log4js'),
	socketIO = require('./src/app/socket.io');

var logger = log4js.getLogger();

var server = http.createServer(express);
server.listen(express.get('port'), function(){
	logger.info('Express server start running ');
});
socketIO(server);
