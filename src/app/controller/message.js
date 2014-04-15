var gmessageService = require('../service/GMessageService'),
	smessageService = require('../service/SMessageService'),
	log4js = require('log4js');

var logger = log4js.getLogger();

module.exports = function(app){
	app.put('/api/gmessage',function(req,res){
		var gmessage = {
			to : req.body.to,
			from : req.session.user.id,
			orgId : req.session.user.orgId,
			content : req.body.content
		}

		gmessageService.send(gmessage,function(err){
			if(err){
				logger.error(err);
				res.json({code : 10001,msg : err.message});
				return;
			}

			res.json({code : 10000});
		});
	});

	app.put('/api/smessage',function(req,res){
		var smessage = {
			to : req.body.to,
			from : req.session.user.id,
			orgId : req.session.user.orgId,
			content : req.body.content
		}

		smessageService.send(smessage,function(err){
			if(err){
				logger.error(err);
				res.json({code : 10001,msg : err.message});
				return;
			}

			res.json({code : 10000});
		});
	});
}
