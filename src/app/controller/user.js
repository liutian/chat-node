
module.exports = function(app){
	app.post('/login', function(req, res){
		if(req.body.username == 'liuss' && req.body.password == '123456'){
			req.session.user = {};
			res.json({code : 10000});
		}else{
			delete req.session.user;
			res.json({code : 10001,msg : 'invalid username password!'});
		}
	});

	app.get('/api/user',function(req,res){
		res.json([{name : 'sd',age : 1},{name : 'ffd',age : 34}]);
	});

}


