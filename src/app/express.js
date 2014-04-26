var express = require('express'),
	controller = require('./controller'),
	path = require('path'),
	domain = require('domain'),
	log4js = require('log4js'),
	connectRedis = require('connect-redis');

var logger = log4js.getLogger();
var RedisStore = connectRedis(express);
var sessionStore = new RedisStore({
	host : global.prop.redis.host,
	port : global.prop.redis.port,
	ttl : global.prop.redis.sessionTTL
});

var app = express();
app.sessionStore = sessionStore;

var sessionKey = global.appData.sessionKey = global.prop.express.sessionKey || 'sid';
var cookieSecret = global.appData.cookieSecret = global.prop.express.cookieSecret || 'express';
//fetch sid from req.url for session
var sidRegExp = new RegExp(";" + sessionKey + "=(.+)$","i");
app.stack.unshift({ route: '', handle: function(req,res,next){
	var m = req.url.match(sidRegExp);
	if(m && m[1]){
		req.headers.cookie = sessionKey + '=' + m[1] + ';' + (req.headers.cookie ? req.headers.cookie : '');
		req.url = req.url.replace(sidRegExp,'');
	}

	var d = domain.create();
	//监听domain的错误事件
	d.on('error', function (err) {
		logger.error(err);
		res.statusCode = 500;
		res.json({code : 10001,msg : 'server error'});
//		d.dispose();
	});

	d.add(req);
	d.add(res);
	d.run(next);

} });

// all environments
app.set('port', global.prop.express.port || 3000);
app.set('views', global.prop.views || path.join(global.appData.cwd, 'views'));
app.set('view engine', 'jade');

//set up middleware
app.use(express.static(global.prop.static || path.join(global.appData.cwd, 'public')));
app.use(express.favicon());
if(global.prop.express.logger){
	app.use(express.logger(global.prop.express.logger));
}
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser(cookieSecret));
app.use(express.session({
	key : sessionKey,
	store: sessionStore
}));

//The use of only allowed to have landed
app.use('/api',function(req,res,next){
	if(!req.session.user){
		res.statusCode = 302;
		res.json({code : 9999,msg : 'Unauthorized'});
	}else{
		next();
	}
});

//The use of only allowed to have assign ip
app.use('/trust-api',function(req,res,next){
 	var trustIP = global.prop.trustIP;

	if(trustIP.indexOf(req.ip) != -1){
		next();
	}else{
		res.statusCode = 401;
		res.json({code : 9999,msg : 'you can not trust'});
	}
});

app.use(app.router);

if (global.prop.express.errorHandler) {
	app.use(express.errorHandler());
}

controller(app);

module.exports = app;