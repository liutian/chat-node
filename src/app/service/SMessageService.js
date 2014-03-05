var mongoose = require('mongoose')
    , _ = require('underscore')
    , BaseError = require('../common/BaseError.js');


var SMessage = mongoose.model('smessage');

exports.send = function(smessage,cb){
    if(validateSMessage(smessage,cb)){
        var mSMessage = new SMessage(smessage);
        mSMessage.contentText = mSMessage.content;
        mSMessage.save(cb);
    }
}

exports.findNewMessage = function(userId,orgId,cb){
    SMessage.find({to : userId,orgId : orgId,read : 'n'})
        .sort('-createDate').exec(function(err,messages){
        if(err){
            cb(err);
        }else if(messages && messages.length > 0){
            var _newMessages = {};
            var newMessage = [];
            for(var i = 0;i < messages.length;i++){
                var message = messages[i];
                if(!_newMessages.hasOwnProperty(message.from)){
                    var newMsg = message.toJSON();
                    newMsg.unreadCount = 1;
                    _newMessages[newMsg.from] = newMsg;
                }else{
                    _newMessages[newMsg.from].unreadCount ++;
                }
            }
            _.forEach(_newMessages,function(val){
                newMessage.push(val);
            });
            cb(null,newMessage);
        }else{
            cb(null,[]);
        }
    });
};

function validateSMessage(smessage,cb){
    if(!smessage.content || smessage.content.length == 0){
        cb(new BaseError('smessage need content '));
        return false;
    }
    if(!smessage.from){
        cb(new BaseError('smessage need from'));
        return false;
    }
    if(!smessage.to){
        cb(new BaseError('smessage need to'));
        return false;
    }
    if(smessage.from == smessage.to){
        cb(new BaseError('smessage from and to must diff'));
        return false;
    }
    if(!smessage.orgId){
        cb(new BaseError('smessage need orgId'));
        return false;
    }
    return true;
}
