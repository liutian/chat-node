var gmessageService = require('../service/GMessageService'),
	log4js = require('log4js'),
	JPush = require('jpush-sdk'),
	_ = require('underscore');

var logger = log4js.getLogger();
var jpushClient = JPush.build({appkey: global.prop.jpush.appkey, masterSecret: global.prop.jpush.masterSecret});


module.exports = function(app){
	app.put('/api/gmessage',function(req,res){
		var gmessage = {
			toRefId : req.body.toTeamId,
			from : req.session.user.id,
			fromRefId : req.session.user.refId,
			fromNickName : req.session.user.nickName,
			fromProfilePhoto : req.session.user.profilePhoto,
			orgId : req.session.user.orgId,
			content : req.body.content,
			type : req.body.type,
			filePath : req.body.filePath,
			fileName : req.body.fileName
		}

		gmessageService.send(gmessage,function(err,mGMessage,toGroup){
			sendCallBack(err,mGMessage,toGroup,res,req);
		});
	});

	app.get('/api/gmessage/:id',function(req,res){
		var currUser = req.session.user;
		gmessageService.getMessage(req.params.id,currUser.id,function(err,message){
			if(err){
				logger.error(err);
				res.json({code : 10001,msg : err.message});
				return;
			}

			res.json(message);
		});
	});

	app.post('/api/findGMessage',function(req,res){
		if((!req.body.refId && !req.body.id) || !req.body.startDate || !req.body.pageNum){
			res.json({code : 10001,msg : 'missing parameters'});
			return;
		}

		var limit = 10;
		var skip = (req.body.pageNum - 1) * limit;

		var params = {
			startDate : req.body.startDate,
			skip : skip,
			limit : limit,
			refId : req.body.refId,
			id : req.body.id,
			orgId : req.body.orgId
		}
		gmessageService.findMessage(params,function(err,messages){
			if(err){
				logger.error(err);
				res.json({code : 10001,msg : err.message});
				return;
			}

			_.each(messages,function(message){
				convertMessage(message);
			});
			res.json(messages);
		});
	});

	app.post('/api/gHistorySessionClearZero',function(req,res){
		gmessageService.historySessionClearZeroRefId(req.session.user.id,req.body.id,function(err){
			if(err){
				logger.error(err);
				res.json({code : 10001,msg : err.message});
				return;
			}else{
				res.json({code : 10000});
			}
		});
	});
}

function sendCallBack(err,mGMessage,toGroup,res,req){
	if(err){
		logger.error(err);
		res.json({code : 10001,msg : err.message});
		return;
	}

	mGMessage.from = {
		refId : req.session.user.refId,
		nickName : req.session.user.nickName,
		profilePhoto : req.session.user.profilePhoto
	};
	res.json(convertMessage(mGMessage));

	mobilePush(mGMessage,toGroup);
}

function mobilePush(mGMessage,toGroup){
	var content = mGMessage.contentText,extra = {};

	if(mGMessage.type == 1){
		content = '[图片]';
		extra.path = mGMessage.filePath[1];
	}else if(mGMessage.type == 2){
		content = '[文件]';
		if(mGMessage.fileName.length > 20){
			var suffix = mGMessage.fileName.lastIndexOf('.' + 1);
			extra.fn = mGMessage.fileName.substr(0,20 - suffix.length - 1) + '.' + suffix;
		}else{
			extra.fn = mGMessage.fileName;
		}
		extra.path = mGMessage.filePath[0];
	}else if (content.length > 50){
		content = content.substr(0,50);
		extra.id = mGMessage.id;
	}

	extra.ct = mGMessage.type;
	extra.uid = mGMessage.from.refId;
	extra.ios = {sound : 'default'};

	for(var i = 0;i < toGroup.members.length;i++){
		var member = toGroup.members[i];
		if(member.refId == mGMessage.from.refId) continue;

		var sendNo = global.prop.jpush.groupChatSendNo;
		jpushClient.sendNotificationWithAlias(sendNo,member.loginName,mGMessage.from.nickName,content,1,extra,function(err,body){
			if(err){
				logger.error(err);
			}
		});
	}
}

function convertMessage(message){
	message.fromUserId = message.from.refId;
	message.fromUserName = message.from.nickName;
	message.fromUserPhoto = message.from.profilePhoto;
	if(message.type == 1){
		message.filePathUri = message.filePath[0];
		message.filePathMidUri = message.filePath[1];
	}else if(message.type == 2){
		message.filePathUri = message.filePath[0];
	}
	message.createDateFmt = moment(message.createDate).format('YYYY-MM-dd HH:mm:ss');

	return message;
}