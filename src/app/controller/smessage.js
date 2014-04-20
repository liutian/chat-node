var smessageService = require('../service/SMessageService'),
	log4js = require('log4js'),
	JPush = require('jpush-sdk'),
	moment = require('moment'),
	_ = require('underscore');

var logger = log4js.getLogger();
var jpushClient = JPush.build({appkey: global.prop.jpush.appkey, masterSecret: global.prop.jpush.masterSecret});


module.exports = function(app){
	app.put('/api/smessage',function(req,res){
		var smessage = {
			toRefId : req.body.toUserId,
			from : req.session.user.id,
			fromRefId : req.session.user.refId,
			fromNickName : req.session.user.nickName,
			orgId : req.session.user.orgId,
			content : req.body.content,
			type : req.body.type,
			filePath : req.body.filePath,
			fileName : req.body.fileName
		}

		smessageService.send(smessage,function(err,mSMessage,toUser){
			sendCallBack(err,mSMessage,toUser,res,req);
		});
	});

	app.get('/api/smessage/:id',function(req,res){
		smessageService.getMessage(req.params.id,function(err,message){
			if(err){
				logger.error(err);
				res.json({code : 10001,msg : err.message});
				return;
			}

			var currUser = req.session.user;
			if(message.to != currUser.id && message.from != currUser.id){
				res.json({code : 10001,msg : 'have no right'});
			}else{
				res.json(message);
			}
		});
	});

	app.post('/api/findSMessage',function(req,res){
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
			id : req.body.id
		}
		smessageService.findMessage(params,function(err,messages){
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

	app.post('/api/sHistorySessionClearZero',function(req,res){
		smessageService.historySessionClearZeroRefId(req.session.user.id,req.body.id,function(err){
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

function sendCallBack(err,mSMessage,toUser,res,req){
	if(err){
		logger.error(err);
		res.json({code : 10001,msg : err.message});
		return;
	}

	mSMessage.from = {
		refId : req.session.user.refId,
		nickName : req.session.user.nickName,
		profilePhoto : req.session.user.profilePhoto
	};
	mSMessage.to = {
		refId : toUser.refId,
		nickName : toUser.nickName,
		profilePhoto : toUser.profilePhoto
	}
	res.json(convertMessage(mSMessage));

	mobilePush(mSMessage);
}

function mobilePush(mSMessage){
	var content = mSMessage.contentText,extra = {};

	if(mSMessage.type == 1){
		content = '[图片]';
		extra.path = mSMessage.filePath[1];
	}else if(mSMessage.type == 2){
		content = '[文件]';
		if(mSMessage.fileName.length > 20){
			var suffix = mSMessage.fileName.lastIndexOf('.' + 1);
			extra.fn = mSMessage.fileName.substr(0,20 - suffix.length - 1) + '.' + suffix;
		}else{
			extra.fn = mSMessage.fileName;
		}
		extra.path = mSMessage.filePath[0];
	}else if (content.length > 50){
		content = content.substr(0,50);
		extra.id = mSMessage.id;
	}

	extra.ct = mSMessage.type;
	extra.uid = mSMessage.from.refId;
	extra.ios = {sound : 'default'};

	var sendNo = global.prop.jpush.whisperSendNo;
	jpushClient.sendNotificationWithAlias(sendNo,mSMessage.to.loginName,mSMessage.from.nickName,content,1,extra,function(err,body){
		if(err){
			logger.error(err);
		}
	});
}

function convertMessage(message){
	message.fromUserId = message.from.refId;
	message.fromUserName = message.from.nickName;
	message.fromUserPhoto = message.from.profilePhoto;
	message.toUserId = message.to.refId;
	message.toUserName = message.to.nickName;
	message.toUserPhoto = message.to.profilePhoto;
	if(message.type == 1){
		message.filePathUri = message.filePath[0];
		message.filePathMidUri = message.filePath[1];
	}else if(message.type == 2){
		message.filePathUri = message.filePath[0];
	}
	message.createDateFmt = moment(message.createDate).format('YYYY-MM-dd HH:mm:ss');

	return message;
}
