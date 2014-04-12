var userService = require('../../app/service/UserService.js');

module.exports = function(app){
	app.post('/login', function(req, res){
		userService.loginIn(req.body,function(err){
			if(!err && err == null){
				req.session.user = {loginName : req.body.loginName};
				res.json({code : 10000});
			}else{
				delete req.session.user;
				res.json({code : 10001,msg : 'invalid username password!'});
			}
		});
	});

	app.get('/api/user',function(req,res){
		res.json([{name : 'sd',age : 1},{name : 'ffd',age : 34}]);
	});

}


