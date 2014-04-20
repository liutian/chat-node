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
		User.find({refId : smessage.toRefId},function(err,user){
			_send(err,user,smessage,cb);
		});
    }
}

exports.getMessage = function(id,cb){
	SMessage.findById(id,cb);
}

exports.findMessage = function(params,cb){
	if(params.id){
		findMessageCallBack(params.id,params,cb);
	}else if(params.refId){
		User.findOne({refId : params.refId},function(err,user){
			if(err){
				cb(err);
			}else if(!user){
			 	cb(new BaseError('this user not exists'));
			}else{
				findMessageCallBack(err,user.id,params,cb);
			}
		});
	}

}

function findMessageCallBack(sessionId,params,cb){
	SMessage.find({sessionId : sessionId,createDate : {$lte : params.startDate}})
		.populate({
			path : 'from to',
			select : 'refId loginName nickName profilePhoto'
		})
		.sort('createDate').skip(params.skip).limit(params.limit)
		.exec(cb);
}

exports.historySessionClearZero = function(currUserId,targetUserId,cb){
	var unreadCount = {};
	unreadCount['whisperSessionUnreadCount.' + targetUserId] = 0;
	SMessage.findById(currUserId,{$set: unreadCount},function(err){
		cb(err);
	});
}

exports.historySessionClearZeroRefId = function(currUserId,refId,cb){
	User.find({refId : refId},function(err,user){
		if(user){
			exports.historySessionClearZero(currUserId,user.id,cb);
		}else{
			cb(err);
		}
	});
}


function validateSMessage(smessage, cb) {
    if (smessage.type != 1 && smessage.type != 2
	    && (!smessage.content || smessage.content.length == 0)) {
        cb(new BaseError('smessage need content '));
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
    if (smessage.from == smessage.to) {
        cb(new BaseError('smessage from and to must diff'));
        return false;
    }
    if (!smessage.orgId) {
        cb(new BaseError('smessage need orgId'));
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
		from : mSMessage.from,
		fromRefId : smessage.fromRefId,
		to : mSMessage.to,
		toRefId : toUser.refId,
		type : mSMessage.type,
		fromNickName : smessage.fromNickName,
		toNickName : toUser.nickName,
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
