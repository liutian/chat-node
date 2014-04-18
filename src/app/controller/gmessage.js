var gmessageService = require('../service/GMessageService'),
	log4js = require('log4js'),
	JPush = require('jpush-sdk');

var logger = log4js.getLogger();
var jpushClient = JPush.build({appkey: global.prop.jpush.appkey, masterSecret: global.prop.jpush.masterSecret});


module.exports = function(app){
	app.put('/api/gmessage',function(req,res){
		var gmessage = {
			refId : req.body.toTeamId,
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

			jpushClient.sendNotificationWithTag(global.prop.jpush.groupChatSendNo,gmessage.to,'群聊',gmessage.content,function(err,body){
				if(err){
					logger.error(err);
				}
			});
			res.json({code : 10000});
		});
	});

	app.get('/api/findNewGMessage',function(req,res){
		var currUser = req.session.user;
		gmessageService.findNewMessage(currUser.id,currUser.orgId,function(err,gmessages){
			if(err){
				logger.error(err);
				res.json({code : 10001,msg : err.message});
				return;
			}

			res.json(gmessages);
		});
	});

	app.get('/api/findUnreadGMessages/:groupId',function(req,res){
		var currUser = req.session.user;
		gmessageService.findUnreadMessages(currUser.id,req.params.groupId,currUser.orgId,function(err,gmessages){
			if(err){
				logger.error(err);
				res.json({code : 10001,msg : err.message});
				return;
			}

			res.json(gmessages);
		});
	});
}