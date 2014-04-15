var userService = require('../../app/service/UserService.js'),
	BaseError = require('../common/BaseError'),
	log4js = require('log4js');

var logger = log4js.getLogger();

module.exports = function(app){
	app.post('/login', function(req, res){
		userService.loginIn(req.body,function(err,udata){
			if(!err && err == null){
				req.session.user = udata;
				res.json({code : 10000});
			}else{
				logger.error(err);
				delete req.session.user;
				res.json({code : 10001,msg : err.message});
			}
		});
	});

	app.get('/api/user',function(req,res){
		res.json([{name : 'sd',age : 1},{name : 'ffd',age : 34}]);
	});

}


