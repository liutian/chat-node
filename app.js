
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var RedisStore = require('connect-redis')(express);

var app = express();

//fetch sid from req.url for session
var sidRegExp = /;sid=(.+)$/i;
app.stack.unshift({ route: '', handle: function(req,res,next){
	var m = req.url.match(sidRegExp);
	if(m && m[1]){
		req.headers.cookie = 'sid=' + m[1] + ';' + (req.headers.cookie ? req.headers.cookie : '');
		req.url = req.url.replace(sidRegExp,'');
	}
	next();
} });

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session({ key : 'sid',store: new RedisStore({host : '127.0.0.1',port : 6379,ttl : 1800}) }));

app.use('/api',function(req,res,next){
	if(!req.session.user){
		console.log('api connect unauthorized');
		res.json(result(401,'Unauthorized'));
	}else{
		console.log('api connect');
		next();
	}
});

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/login', user.login);

app.get('/api/user',user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


function result(code, msg) {
	var result = {};

	if(!code && !msg){
		result.code = 10000;
	}else if(!msg){
		result.code = 10001;
		result.msg = status;
	}else{
		result.code = code;
		result.msg = msg;
	}

	return result;
}
