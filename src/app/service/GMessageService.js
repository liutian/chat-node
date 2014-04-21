var mongoose = require('mongoose')
	, _ = require('underscore')
	,log4js = require('log4js')
	, BaseError = require('../common/BaseError.js');

var logger = log4js.getLogger();
var GMessage = mongoose.model('gmessage');
var Group = mongoose.model('group');
var User = mongoose.model('user');

exports.send = function (gmessage, cb) {
	if (!validateGMessage(gmessage, cb)) return;

	if (gmessage.to) {
		Group.findOne({_id : gmessage.to,orgId : gmessage.orgId,members : gmessage.from})
			.exec( function (err, group) {
			_send(err, group,gmessage, cb);
		});
	} else {
		Group.findOne({refId: gmessage.toRefId, orgId: gmessage.orgId,members : gmessage.from})
			.exec( function (err, group) {
			_send(err, group,gmessage, cb);
		});
	}
}

exports.getMessage = function(id,currUserId,cb){
	GMessage.findById(id,function(err,message){
		if(err){
			cb(err);
			return;
		}

		Group.find({id : message.to,members : currUserId},function(err,group){
			if(err){
				cb(err);
				return;
			}

			if(!group){
				cb(new BaseError('have no right'));
			}else{
				cb(null,message);
			}
		})
	});
}

exports.findMessage = function(params,cb){
	if(params.id){
		Group.findOne({id : params.id,members : params.currUserId},function(err,group){
			findMessageCallBack(err,group,params,cb);
		});
	}else if(params.refId){
		Group.findOne({refId : params.refId,orgId : params.orgId,members : params.currUserId},function(err,group){
			findMessageCallBack(err,group,params,cb);
		});
	}
}

exports.historySessionClearZero = function(currUserId,targetGroupId,cb){
	var unreadCount = {};
	unreadCount['groupSessionUnreadCount.' + targetGroupId] = 0;
	GMessage.findById(currUserId,{$set: unreadCount},function(err){
		cb(err);
	});
}

exports.historySessionClearZeroRefId = function(currUserId,refId,cb){
	Group.find({refId : refId},function(err,group){
		if(group){
			exports.historySessionClearZero(currUserId,group.id,cb);
		}else{
			cb(err);
		}
	});
}

function _send(err, group,gmessage, cb) {
	if (err) {
		cb(err);
	} else if (!group) {
		cb(new BaseError('this group not exists or you have no right id:%s', gmessage.to || gmessage.toRefId));
	} else {
		gmessage.to = group.id;
		gmessage.contentText = gmessage.content;

		if(gmessage.type == 1){
			gmessage.content = '<a href="'+ gmessage.filePath[0] +'"><img src="'+ gmessage.filePath[1] +'"></a>';
			gmessage.contentText = '[图片]' + gmessage.fileName;
		}else if(gmessage.type == 2){
			gmessage.content = '<a href="'+ gmessage.filePath[0] +'">'+ gmessage.fileName +'</a>';
			gmessage.contentText = '[文件]' + gmessage.fileName;
		}else{
			gmessage.type = 0;
		}

		var mGMessage = new GMessage(gmessage);
		mGMessage.save(function(err){
			if(!err){
				saveHistorySession(mGMessage,gmessage,group);
			}

			cb(err,mGMessage,group);
		});
	}
}


function saveHistorySession(mGMessage,gmessage,group){
	var _session = {
		from : mGMessage.from,
		fromRefId : gmessage.fromRefId,
		fromProfilePhoto : gmessage.fromProfilePhoto,
		to : mGMessage.to,
		toRefId : group.refId,
		toProfilePhoto : group.profilePhoto,
		type : mGMessage.type,
		fromNickName : gmessage.fromNickName,
		toNickName : group.name,
		date : mGMessage.createDate,
		contentText : mGMessage.contentText.substr(0,20)
	}

	var toSession = {};
	toSession['groupSession.' + group.id] = _session;
	var toSessionUnreadCount = {};
	toSessionUnreadCount['groupSessionUnreadCount.' + group.id] = 1;
	for(var i = 0;i < group.members.length;i++){
		var toUserId = group.members[i];
		User.findByIdAndUpdate(toUserId,{$set : toSession,$inc : toSessionUnreadCount},function(err){
			if(err) logger.error(err);
		});
	}

	var fromSession = {};
	fromSession['groupSession.' + group.id] = _session;
	User.findByIdAndUpdate(gmessage.from,{$set : fromSession},function(err){
		if(err) logger.error(err);
	});
}

function validateGMessage(gmessage, cb) {
	if (gmessage.type != 1 && gmessage.type != 2
		&& (!gmessage.content || gmessage.content.length == 0)) {
		cb(new BaseError('gmessage need content'));
		return false;
	}
	if (!gmessage.from) {
		cb(new BaseError('gmessage need from'));
		return false;
	}
	if (!gmessage.to && !gmessage.toRefId) {
		cb(new BaseError('gmessage need to or toRefId'));
		return false;
	}
	if (!gmessage.orgId) {
		cb(new BaseError('gmessage need orgId'));
		return false;
	}
	return true;
}


function findMessageCallBack(err,group,params,cb){
	if(err){
		cb(err);
	}else if(!group){
		cb(new BaseError('this group not exists or you have no right'));
	}else{
		var query = {to : group.id};
		if(params.startDate){
			query.createDate = {$lte : params.startDate};
		}
		GMessage.find(query)
			.populate({
				path : 'from',
				select : 'refId loginName nickName profilePhoto'
			})
			.sort('-createDate').skip(params.skip).limit(params.limit)
			.exec(function(err,messages){
				cb(err,messages);
			});
	}
}
