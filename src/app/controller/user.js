var userService = require('../../app/service/UserService.js'),
	BaseError = require('../common/BaseError'),
	log4js = require('log4js');

var logger = log4js.getLogger();

module.exports = function(app){

	app.post('/signUp',function(req,res){
		userService.signUp(req.body,function(err){
			if(err){
				logger.error(err);
				res.json({code : 10001,msg : err.message});
			}else{
				res.json({code : 10000});
			}
		});
	});

	app.post('/signIn', function(req, res){
		userService.signIn(req.body,function(err,udata){
			if(err){
				logger.error(err);
				delete req.session.user;
				res.json({code : 10001,msg : err.message});
			}else{
				req.session.user = udata;
				res.json({code : 10000});
			}
		});
	});

	app.post('/api/editUser',function(req,res){
		userService.editUser(req.body,function(err){
			if(err){
				logger.error(err);
				res.json({code : 10001,msg : err.message});
			}else{
				res.json({code : 10000});
			}
		});
	});

	app.get('/api/user',function(req,res){
		res.json([{name : 'sd',age : 1},{name : 'ffd',age : 34}]);
	});

}


