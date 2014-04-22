var smessageService = require('../service/SMessageService'),
	log4js = require('log4js'),
	moment = require('moment'),
	_ = require('underscore'),
	jpushWrap = require('../common/jpushWrap');

var logger = log4js.getLogger();

module.exports = function(app){
	app.post('/api/smessage',function(req,res){
		var smessage = {
			toRefId : req.body.toUserId,
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
		if((!req.body.refId && !req.body.id) || !req.body.pageNum){
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
			currUserId : req.session.user.id
		}
		smessageService.findMessage(params,function(err,messages){
			if(err){
				logger.error(err);
				res.json({code : 10001,msg : err.message});
				return;
			}

			var warpMessages = [];
			_.each(messages,function(message){
				warpMessages.unshift(convertMessage(message));
			});
			res.json(warpMessages);
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

//	mSMessage.from = {
//		refId : req.session.user.refId,
//		nickName : req.session.user.nickName,
//		profilePhoto : req.session.user.profilePhoto
//	};
//	mSMessage.to = {
//		refId : toUser.refId,
//		nickName : toUser.nickName,
//		profilePhoto : toUser.profilePhoto,
//		loginName : toUser.loginName
//	}

	res.json(convertMessage(mSMessage));

	var fromLoginName = req.session.user.loginName;
	var fromRefId = req.session.user.refId;
	mobilePush(mSMessage,toUser.loginName,fromLoginName,fromRefId);
}

function mobilePush(mSMessage,alias,fromLoginName,fromRefId){
	var content = {message : mSMessage.contentText,n_extras : {}};

	if(mSMessage.type == 1){
		content.message = '[图片]';
		content.n_extras.path = mSMessage.filePath[1];
	}else if(mSMessage.type == 2){
		content.message = '[文件]';
		if(mSMessage.fileName.length > 20){
			var suffix = mSMessage.fileName.lastIndexOf('.' + 1);
			content.n_extras.fn = mSMessage.fileName.substr(0,20 - suffix.length - 1) + '.' + suffix;
		}else{
			content.n_extras.fn = mSMessage.fileName;
		}
		content.n_extras.path = mSMessage.filePath[0];
	}else if (content.length > 50){
		content.message = content.message.substr(0,50);
		content.n_extras.id = mSMessage.id;
	}

	content.n_extras.ct = mSMessage.type;
	content.n_extras.uid = fromRefId;
	content.n_extras.ios = {sound : 'default'};
	content.n_extras.type = global.prop.jpush.extrasWhisperType;

	var sendNo = global.prop.jpush.whisperSendNo;

	jpushWrap(sendNo,alias,fromLoginName,content,function(err,body){
		if(err){
			logger.error(err);
		}
	});
}

function convertMessage(message){
	var newMessage = message.toObject();

	newMessage.id = message._id;
	newMessage.fromUserId = message.from.refId;
	newMessage.fromUserName = message.from.nickName;
	newMessage.fromUserPhoto = message.from.profilePhoto;
	newMessage.toUserId = message.to.refId;
	newMessage.toUserName = message.to.nickName;
	newMessage.toUserPhoto = message.to.profilePhoto;
	if(message.type == 1){
		newMessage.filePathUri = message.filePath[0];
		newMessage.filePathMidUri = message.filePath[1];
	}else if(message.type == 2){
		newMessage.filePathUri = message.filePath[0];
	}
	newMessage.createDate = message.createDate ? message.createDate.getTime() : 0;
	newMessage.createDateFmt = moment(message.createDate).format('YYYY-MM-DD HH:mm:ss');

	return newMessage;
}
