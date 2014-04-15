process.env.NODE_ENV = 'development';
/**
 * Module dependencies.
 */
global.appData = {};

require('./src/prop.js');

require('./src/log')({
	dir : __dirname + '/log/',
	level : process.env.NODE_ENV != 'development' ? 'ERROR' : ''
});

require('./src/app/schema');

var http = require('http'),
	express = require('./src/app/express'),
	log4js = require('log4js'),
	domain = require('domain'),
	socketIO = require('./src/app/socket.io');

var logger = log4js.getLogger();


var d = domain.create();
//监听domain的错误事件
d.on('error', function (err) {
	logger.error(err);
//		d.dispose();
});

d.run(function(){
	var server = http.createServer(express);
	server.listen(express.get('port'), function(){
		logger.info('Express server start running ');
	});
	socketIO(server);
});

