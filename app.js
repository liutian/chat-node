//全局应用级别的数据对象
global.appData = {cwd : __dirname};

//加载，并读取配置文件
require('./src/prop.js');

//启动日志系统
require('./src/log')({
	console : global.prop.log.console === true,
	dir : global.prop.log.dir || __dirname + '/log/',
	level : global.prop.log.level || 'ERROR'
});

//启动数据访问系统
require('./src/app/schema');

//web
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

