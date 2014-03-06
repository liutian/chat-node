var mongoose = require('mongoose')
    , _ = require('underscore')
    , BaseError = require('../common/BaseError.js');


var SMessage = mongoose.model('smessage');

exports.send = function (smessage, cb) {
    if (validateSMessage(smessage, cb)) {
        var mSMessage = new SMessage(smessage);
        mSMessage.contentText = mSMessage.content;
        mSMessage.save(cb);
    }
}

exports.findNewMessage = function (userId, orgId, cb) {
    SMessage.find({to: userId, orgId: orgId, read: 'n'})
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
    SMessage.find({from: from, to: to, orgId: orgId, read: 'n'}).sort('createDate')
        .exec(function (err, messages) {
            SMessage.update({from: from, to: to, orgId: orgId, read: 'n'}
                , {$set: {read: 'y'}},{multi: true},function(){
                cb(err, messages);
            });
        });
}

function validateSMessage(smessage, cb) {
    if (!smessage.content || smessage.content.length == 0) {
        cb(new BaseError('smessage need content '));
        return false;
    }
    if (!smessage.from) {
        cb(new BaseError('smessage need from'));
        return false;
    }
    if (!smessage.to) {
        cb(new BaseError('smessage need to'));
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
