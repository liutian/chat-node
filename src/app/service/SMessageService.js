var mongoose = require('mongoose')
    , _ = require('underscore')
	,log4js = require('log4js')
    ,BaseError = require('../common/BaseError.js')
	,util = require('../common/util.js');

var logger = log4js.getLogger();
var SMessage = mongoose.model('smessage');
var User = mongoose.model('user');

exports.send = function (smessage, cb) {
    if (!validateSMessage(smessage, cb)) return;

	if(smessage.to){
		User.findById(smessage.to,function(err,user){
	        _send(err,user,smessage,cb);
		});
	}else{
		User.findOne({refId : smessage.toRefId},function(err,user){
			_send(err,user,smessage,cb);
		});
    }
}

exports.getMessage = function(id,currUserId,cb){
	SMessage.findById(id,function(err,message){
		if(err){
			cb(err);
		}else if(!message){
			cb(new BaseError('this message not exists'));
		}else if(message.to != currUserId && message.from != currUserId){
			cb(new BaseError('have no right'));
		}else{
			cb(null,message);
		}
	});
}

exports.findMessage = function(params,cb){
	if(params.id){
		var sessionId = util.createSessionId(params.currUserId,params.id);
		findMessageCallBack(sessionId,params,cb);
	}else if(params.refId){
		User.findOne({refId : params.refId},function(err,user){
			if(err){
				cb(err);
			}else if(!user){
			 	cb(new BaseError('this user not exists'));
			}else{
				var sessionId = util.createSessionId(params.currUserId,user.id);
				findMessageCallBack(sessionId,params,cb);
			}
		});
	}

}

exports.historySessionClearZero = function(currUserId,targetUserId,cb){
	var unreadCount = {};
	unreadCount['whisperSessionUnreadCount.' + targetUserId] = 0;
	SMessage.findByIdAndUpdate(currUserId,{$set: unreadCount},function(err){
		cb(err);
	});
}

exports.historySessionClearZeroRefId = function(currUserId,refId,cb){
	User.find({refId : refId},function(err,user){
		if(err){
			cb(err);
		}else if(!user){
			cb(new BaseError('currUser not exists refId:%s',refId));
		}else{
			exports.historySessionClearZero(currUserId,user.id,cb);
		}
	});
}

function findMessageCallBack(sessionId,params,cb){
	var query = {sessionId : sessionId};
	if(params.startDate){
		query.createDate = {$lte : params.startDate};
	}
	SMessage.find(query)
		.populate({
			path : 'from to',
			select : 'refId loginName nickName profilePhoto'
		})
		.sort('-createDate').skip(params.skip).limit(params.limit)
		.exec(cb);
}

function validateSMessage(smessage, cb) {
    if (smessage.type != 1 && smessage.type != 2
	    && !smessage.content) {
        cb(new BaseError('smessage need content '));
        return false;
    }
	if(smessage.type == 1 && smessage.type == 2 && _.isArray(smessage.filePath)){
		cb(new BaseError('need filePath'));
		return false;
	}
    if (!smessage.from) {
        cb(new BaseError('smessage need from'));
        return false;
    }
    if (!smessage.to && !smessage.toRefId) {
        cb(new BaseError('smessage need to or toRefId'));
        return false;
    }
    if (!smessage.toRefId && smessage.from == smessage.to) {
        cb(new BaseError('smessage from and to must diff'));
        return false;
    }
    return true;
}

function _send (err,toUser,smessage,cb){
	if(err){
		cb(err);
	}else if(!toUser){
		cb(new BaseError('user:%s not exists ', smessage.to || smessage.toRefId));
	}else{
		smessage.sessionId = util.createSessionId(smessage.from,toUser.id);
		smessage.to = toUser.id;
		smessage.contentText = smessage.content;

		if(smessage.type == 1){
			smessage.content = '<a href="'+ smessage.filePath[0] +'"><img src="'+ smessage.filePath[1] +'"></a>';
			smessage.contentText = '[图片]' + smessage.fileName;
		}else if(smessage.type == 2){
			smessage.content = '<a href="'+ smessage.filePath[0] +'">'+ smessage.fileName +'</a>';
			smessage.contentText = '[文件]' + smessage.fileName;
		}else{
			smessage.type = 0;
		}

		var mSMessage = new SMessage(smessage);
		mSMessage.save(function(err){
			if(!err){
				saveHistorySession(mSMessage,smessage,toUser);
			}

			cb(err,mSMessage,toUser);
		});
	}
}

function saveHistorySession(mSMessage,smessage,toUser){
	var _session = {
		from : smessage.from,
		fromRefId : smessage.fromRefId,
		fromProfilePhoto : smessage.fromProfilePhoto,
		fromNickName : smessage.fromNickName,
		to : toUser.id,
		toRefId : toUser.refId,
		toProfilePhoto : toUser.profilePhoto,
		toNickName : toUser.nickName,
		type : mSMessage.type,
		date : mSMessage.createDate,
		contentText : mSMessage.contentText.substr(0,20)
	}

	var toSession = {};
	toSession['whisperSession.' + smessage.from] = _session;
	var toSessionUnreadCount = {};
	toSessionUnreadCount['whisperSessionUnreadCount.' + smessage.from] = 1;
	User.findByIdAndUpdate(toUser.id,{$set : toSession,$inc : toSessionUnreadCount},function(err){
		if(err) logger.error(err);
	});

	var fromSession = {};
	fromSession['whisperSession.' + toUser.id] = _session;
	User.findByIdAndUpdate(smessage.from,{$set : fromSession},function(err){
		if(err) logger.error(err);
	});
}
