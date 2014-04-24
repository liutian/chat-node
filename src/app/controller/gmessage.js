var gmessageService = require('../service/GMessageService'),
	log4js = require('log4js'),
	_ = require('underscore'),
	moment = require('moment'),
	jpushWrap = require('../common/jpushWrap'),
	ctrlUtil = require('../common/ControllerUtil');

var logger = log4js.getLogger();

module.exports = function(app){
	/**
	 *  filePath,fileName,type,content,to
	 * req.body
	 */
	app.post('/api/gmessage',function(req,res){
		var gmessage = {
			toRefId : req.body.toTeamId,
			from : req.session.user.id,
			fromRefId : req.session.user.refId,
			fromNickName : req.session.user.nickName,
			fromProfilePhoto : req.session.user.profilePhoto,
			orgId : req.session.user.orgId
		}

		var postData = _.extend(req.body,gmessage);

		gmessageService.send(gmessage,function(err,mGMessage,toGroup){
			sendCallBack(err,mGMessage,toGroup,res,req);
		});
	});

	app.get('/api/gmessage/:id',function(req,res){
		var currUser = req.session.user;
		gmessageService.getMessage(req.params.id,currUser.id,function(err,message){
			ctrlUtil.processToData(message,res,err,logger);
		});
	});

	app.post('/api/findGMessage',function(req,res){
		if((!req.body.refId && !req.body.id) || (!req.body.id && !req.body.orgId)){
			res.json({code : 10001,msg : 'missing parameters'});
			return;
		}

		var pageNum = req.body.pageNum || 1;

		var limit = 10;
		var skip = (pageNum - 1) * limit;

		var params = {
			startDate : req.body.startDate,
			skip : skip,
			limit : limit,
			refId : req.body.refId,
			id : req.body.id,
			orgId : req.body.orgId,
			currUserId : req.session.user.id
		}
		gmessageService.findMessage(params,function(err,messages){
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

	app.post('/api/gHistorySessionClearZero',function(req,res){
		if(!req.body.id && !req.body.refId){
			res.json({code : 10001,msg : 'need id or refId'});
		}

		var currUserId = req.session.user.id;
		if(req.body.id){
			gmessageService.historySessionClearZero(currUserId,req.body.id,function(err){
				ctrlUtil.process(res,err,logger);
			});
		}else{
			gmessageService.historySessionClearZeroRefId(currUserId,req.body.refId,function(err){
				ctrlUtil.process(res,err,logger);
			});
		}
	});
}

function sendCallBack(err,mGMessage,toGroup,res,req){
	if(err){
		logger.error(err);
		res.json({code : 10001,msg : err.message});
		return;
	}

	res.json(convertMessage(mGMessage));

	var fromLoginName = req.session.user.loginName;
	var fromRefId = req.session.user.refId;
	mobilePush(mGMessage,toGroup,fromLoginName,fromRefId);
}

function mobilePush(mGMessage,toGroup,fromLoginName,fromRefId){
	var content = {message : mGMessage.contentText,n_extras : {}};

	if(mGMessage.type == 1){
		content.message = '[图片]';
		content.n_extras.path = mGMessage.filePath[1];
	}else if(mGMessage.type == 2){
		content.message = '[文件]';
		if(mGMessage.fileName.length > 20){
			var suffix = mGMessage.fileName.lastIndexOf('.' + 1);
			content.n_extras.fn = mGMessage.fileName.substr(0,20 - suffix.length - 1) + '.' + suffix;
		}else{
			content.n_extras.fn = mGMessage.fileName;
		}
		content.n_extras.path = mGMessage.filePath[0];
	}else if (content.length > 50){
		content.message = content.message.substr(0,50);
		content.n_extras.id = mGMessage.id;
	}

	content.n_extras.ct = mGMessage.type;
	content.n_extras.uid = fromRefId;
	content.n_extras.ios = {sound : 'default'};
	content.n_extras.type = global.prop.jpush.extrasGroupType;
	content.n_extras.team = toGroup.refId;

	var sendNo = global.prop.jpush.groupChatSendNo;
	for(var i = 0;i < toGroup.members.length;i++){
		var member = toGroup.members[i];
		if(member.refId == fromRefId) continue;

		jpushWrap(sendNo,member.loginName,fromLoginName,content,function(err,body){
			if(err){
				logger.error(err);
			}
		});
	}
}

function convertMessage(message){
	var newMessage = message.toObject();

	newMessage.id = message.id;
	newMessage.fromUserId = message.from.refId;
	newMessage.fromUserName = message.from.nickName;
	newMessage.fromUserPhoto = message.from.profilePhoto;
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