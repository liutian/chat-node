var mongoose = require('mongoose')
    , log4js = require('log4js')
    , _ = require('underscore');


var SMessage = mongoose.model('smessage');
var logger = log4js.getLogger('rlog');

exports.send = function(smessage,cb){
    if(validateSMessage(smessage,cb)){
        var mSMessage = new SMessage(smessage);
        mSMessage.contentText = mSMessage;
        mSMessage.save(cb);
    }
}

function validateSMessage(smessage,cb){
    if(!smessage.content || smessage.content.length == 0){
        cb(new Error('smessage content not allow null'));
        return false;
    }
    if(!smessage.from){
        cb(new Error('smessage from not allow null'));
        return false;
    }
    if(!smessage.to){
        cb(new Error('smessage to not allow null'));
        return false;
    }
    if(smessage.from == smessage.to){
        cb(new Error('smessage from and to must diff'));
    }
    return true;
}
