var express = require('express'),
	controller = require('./controller'),
	path = require('path'),
	domain = require('domain'),
	log4js = require('log4js'),
	connectRedis = require('connect-redis');

var logger = log4js.getLogger();
var RedisStore = connectRedis(express);
var sessionStore = new RedisStore({host : '127.0.0.1',port : 6379,ttl : 1800});
var app = express();
app.sessionStore = sessionStore;

//fetch sid from req.url for session
var sidRegExp = /;sid=(.+)$/i;
app.stack.unshift({ route: '', handle: function(req,res,next){
	var m = req.url.match(sidRegExp);
	if(m && m[1]){
		req.headers.cookie = 'sid=' + m[1] + ';' + (req.headers.cookie ? req.headers.cookie : '');
		req.url = req.url.replace(sidRegExp,'');
	}

	var d = domain.create();
	//监听domain的错误事件
	d.on('error', function (err) {
		logger.error(err);
		res.statusCode = 500;
//		d.dispose();
	});

	d.add(req);
	d.add(res);
	d.run(next);

} });

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname + '../../../', 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('liuss123'));
app.use(express.session({ key : 'sid',store: sessionStore }));

app.use('/api',function(req,res,next){
	if(!req.session.user){
		res.json({code : 401,msg : 'Unauthorized'});
	}else{
		next();
	}
});

app.use(app.router);
app.use(express.static(path.join(__dirname + '../../../', 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

controller(app);

module.exports = app;