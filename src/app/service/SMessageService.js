var mongoose = require('mongoose')
    , _ = require('underscore')
    , BaseError = require('../common/BaseError.js');


var SMessage = mongoose.model('smessage');
var User = mongoose.model('user');

exports.send = function (smessage, cb) {
    if (!validateSMessage(smessage, cb)) return;

	if(smessage.to){
		User.findById(smessage.to,function(err,user){
	        _send(err,user,smessage,cb);
		});
	}else{
		User.find({refId : smessage.refId},function(err,user){
			_send(err,user,smessage,cb);
		});
    }
}

exports.getMessage = function(id,cb){
	SMessage.findById(id,function(err,message){
		cb(err,message);
	});
}

exports.findNewMessage = function (userId, orgId, cb) {
    SMessage.find({to: userId, orgId: orgId, read: 'n'})
	    .populate({
		    path : 'to from',
		    select : 'refId nickName profilePhoto sex letterName'
	    })
        .sort('-createDate').exec(function (err, messages) {
            if (err) {
                cb(err);
                return;
            } else if (!messages || messages.length == 0) {
                cb(null, []);
                return;
            }

            var _newMessages = {};
            var newMessage = [];
            for (var i = 0; i < messages.length; i++) {
                var message = messages[i];
                if (!_newMessages.hasOwnProperty(message.from)) {
                    var newMsg = message.toJSON();
                    newMsg.unreadCount = 1;
                    _newMessages[newMsg.from] = newMsg;
                } else {
                    _newMessages[newMsg.from].unreadCount++;
                }
            }
            _.forEach(_newMessages, function (val) {
                newMessage.push(val);
            });
            cb(null, newMessage);
        });
};

exports.findUnreadMessages = function (from, to, orgId, cb) {
    SMessage.find({from: from, to: to, orgId: orgId, read: 'n'})
	    .populate({
		    path : 'to from',
		    select : 'refId nickName profilePhoto sex letterName'
	    })
	    .sort('createDate')
        .exec(function (err, messages) {
            if(err){
	            cb(err,null);
            }else if(messages && messages.length > 0){
			    SMessage.update({from: from, to: to, orgId: orgId, read: 'n'}
	                , {$set: {read: 'y'}},{multi: true},function(){
	                cb(err, messages);
	            });
            }else{
	           cb(err,messages);
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
    if (!smessage.to && !smessage.refId) {
        cb(new BaseError('smessage need to or refId'));
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

function _send (err,user,smessage,cb){
	if(err){
		cb(err);
	}else if(!user){
		cb(new BaseError('user:%s not exists ', smessage.to || smessage.refId));
	}else{
		smessage.to = user.id;
		smessage.contentText = smessage.content;

		if(smessage.type == 1){
			smessage.content = '<a href="'+ smessage.filePath[0] +'"><img src="'+ smessage.filePath[1] +'"></a>';
			smessage.contentText = '[图片]' + smessage.fileName;
		}else if(smessage.type = 2){
			smessage.content = '<a href="'+ smessage.filePath[0] +'">'+ smessage.fileName +'</a>';
			smessage.contentText = '[文件]' + smessage.fileName;
		}

		var mSMessage = new SMessage(smessage);
		mSMessage.save(function(err){
			cb(err,mSMessage,user);
		});
	}
}
