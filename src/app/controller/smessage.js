var smessageService = require('../service/SMessageService'),
	log4js = require('log4js'),
	JPush = require('jpush-sdk');

var logger = log4js.getLogger();
var jpushClient = JPush.build({appkey: global.prop.jpush.appkey, masterSecret: global.prop.jpush.masterSecret});


module.exports = function(app){
	app.put('/api/smessage',function(req,res){
		var smessage = {
			refId : req.body.toUserId,
			from : req.session.user.id,
			orgId : req.session.user.orgId,
			content : req.body.content,
			type : req.body.type,
			filePath : req.body.filePath,
			fileName : req.body.fileName
		}

		smessageService.send(smessage,function(err){
			if(err){
				logger.error(err);
				res.json({code : 10001,msg : err.message});
				return;
			}

			smessage.from = {refId : req.session.user.refId};
			res.json(convertMessage(smessage));
			jpushClient.sendNotificationWithAlias(global.prop.jpush.whisperSendNo,smessage.to,'私聊',smessage.content,function(err,body){
				if(err){
					logger.error(err);
				}
			});
		});
	});

	app.get('/api/findNewSMessage',function(req,res){
		var currUser = req.session.user;
		smessageService.findNewMessage(currUser.id,currUser.orgId,function(err,gmessages){
			if(err){
				logger.error(err);
				res.json({code : 10001,msg : err.message});
				return;
			}

			res.json(gmessages);
		});
	});

	app.get('/api/findUnreadSMessages/:userId',function(req,res){
		var currUser = req.session.user;
		smessageService.findUnreadMessages(req.params.userId,currUser.id,currUser.orgId,function(err,gmessages){
			if(err){
				logger.error(err);
				res.json({code : 10001,msg : err.message});
				return;
			}

			res.json(gmessages);
		});
	});
}

function convertMessage(message){
	message.fromUserId = message.from.refId;
//	message.fromUserName = message.from.nickName;
	message.filePathUri = message.filePath[0];
	message.filePathMidUri = message.filePath[1];
//	message.userImgUrl = message.from.profilePhoto;
	return message;
}
