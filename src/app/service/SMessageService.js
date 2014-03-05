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
