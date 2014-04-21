var groupService = require('../service/GroupService'),
	log4js = require('log4js'),
	_ = require('underscore');

var logger = log4js.getLogger();

module.exports = function(app){
	app.post('/createGroup',function(req,res){
		groupService.create(req.body,function(err){
			if(err){
				logger.error(err);
				res.json({code : 10001,msg : err.message});
				return;
			}

			res.json({code : 10000});
		});
	});
}