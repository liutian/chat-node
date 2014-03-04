var mongoose = require('mongoose')
    , letter = require('../util/letter.js')
    , log4js = require('log4js')
    , _ = require('underscore');


var Group = mongoose.model('group');
var logger = log4js.getLogger('rlog');

/**
 * @param group
 * {
 *  name : String,
 *  founder : ObjectId,
 *  members : ObjectId,
 *  orgId : ObjectId
 * }
 * @param cb
 */
exports.create = function(group,cb){
    if (!group.orgId) {
        cb(new Error('need orgId'));
        return false;
    }
    if(!group.name){
        cb(new Error('need group name'));
        return;
    }
    if(!group.founder){
        cb(new Error('need group founder'));
        return;
    }
    var mGroup = new Group(group);
    mGroup.letterName = letter(mGroup.name);
    mGroup.save(function(err){
        cb(err);
    });
}

exports.disband = function(userId,groupId,cb){
    Group.findById(groupId,function(err,group){
        if(!group){
            cb(new Error('have no group id:' + groupId));
        }else if(group.founder != userId){
            cb(new Error('you have no right to delete this group :' + groupId));
        }else{
            group.remove(cb);
        }
    });
}

exports.join = function(userId,groupId,cb){
    Group.findById(groupId,function(err,group){
        if(!group){
            cb(new Error('this group not exists :' + groupId));
        }else{
            Group.findByIdAndUpdate(groupId,{$addToSet : {members : userId}},cb);
        }
    });
}

exports.exit = function(userId,groupId,cb){
    Group.findById(groupId,function(err,group){
        if(!group){
            cb(new Error('this group not exists :' + groupId));
        }else{
            Group.findByIdAndUpdate(groupId,{$pull : {members : userId}},cb);
        }
    });
}

exports.rename = function(userId,groupId,name,cb){
    Group.findById(groupId,function(err,group){
        if(!group){
            cb(new Error('this group not exists :' + groupId));
        }else if(group.founder != userId){
            cb(new Error('you have no right to rename this group :' + groupId));
        }else{
            group.name = name;
            group.letterName = letter(name);
            group.save(cb);
        }
    });
}


