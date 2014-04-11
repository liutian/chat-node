var express = require('express'),
	controller = require('./controller'),
	path = require('path'),
	connectRedis = require('connect-redis');

var RedisStore = connectRedis(express);
var sessionStore = new RedisStore({host : '127.0.0.1',port : 6379,ttl : 1800});
var app = express();
app.sessionStore = sessionStore;

//fetch sid from req.url for session
var sidRegExp = /;sid=(.+)$/i;
app.stack.unshift({ route: '', handle: function(req,res,next){
	console.log('have connect111');
	var m = req.url.match(sidRegExp);
	if(m && m[1]){
		req.headers.cookie = 'sid=' + m[1] + ';' + (req.headers.cookie ? req.headers.cookie : '');
		req.url = req.url.replace(sidRegExp,'');
	}
	next();
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
	console.log('/api user');
	if(!req.session.user){
		console.log('/api user Unauthorized');
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