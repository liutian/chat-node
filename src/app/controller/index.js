var fs = require('fs');

module.exports = function(app){
	app.all('*', function(req, res, next){
		if (!req.get('Origin')) return next();
		// use "*" here to accept any origin
		res.set('Access-Control-Allow-Origin', 'http://192.168.1.103:8080');
		res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
		res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
		res.set('Access-Control-Allow-Credentials', true);
		// res.set('Access-Control-Allow-Max-Age', 3600);
		if ('OPTIONS' == req.method) return res.send(200);
		next();
	});

	app.get('/', function(req,res){
		res.render('index', { title: 'Express' });
	});

	fs.readdirSync(__dirname).forEach(function(filename){
		if (!/\.js$/.test(filename) || filename == 'index.js') return;
		var controller = require('./' + filename);
		controller(app);
	});
}