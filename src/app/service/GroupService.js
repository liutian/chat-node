var mongoose = require('mongoose')
    , letter = require('../util/letter.js')
    , _ = require('underscore')
    , BaseError = require('../common/BaseError.js');


var Group = mongoose.model('group');
var User = mongoose.model('user');

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
exports.create = function (group, cb) {
    if (!createValidate(group, cb)) {
        return;
    }

	if(group.founder){
	    User.findById(group.founder, function (err, user) {
		    createCallBack(err,user,group,cb);
	    });
	}else{
		User.findOne({refId : group.founderRefId},function(err,user){
			createCallBack(err,user,group,cb);
		});
	}
}

function createCallBack(err,user,group,cb){
	if (err) {
		cb(err);
	} else if (!user) {
		cb(new BaseError('this user not find userId:%s', group.founder));
	} else {
		group.founder = user.id;
		var mGroup = new Group(group);
		mGroup.members.push(group.founder);
		mGroup.letterName = letter(mGroup.name);
		mGroup.save(function (err) {
			cb(err);
		});
	}
}

exports.disband = function (userId, groupId, cb) {
    Group.findById(groupId, function (err, group) {
        if (!group) {
            cb(new BaseError('this group not exists groupId:%s', groupId));
        } else if (group.founder != userId) {
            cb(new BaseError('you have no right to delete this group , userId:%s groupId:%s', userId, groupId));
        } else {
            group.remove(cb);
        }
    });
}

exports.join = function (userId, groupId, cb) {
    Group.findById(groupId, function (err, group) {
        if (!group) {
            cb(new BaseError('this group not exists ,groupId:%s', groupId));
        } else {
            User.findById(userId,function(err,user){
                if(err){
                    cb(err);
                }else if(!user){
                    cb(new BaseError('this user not exists userId:%',userId));
                }else if(user.orgId != group.orgId){
                    cb(new BaseError('this group not belong to this org ,userId:%s orgId:%s ',userId,user.orgId));
                }else{
                    Group.findByIdAndUpdate(groupId, {$addToSet: {members: userId}}, cb);
                }
            });
        }
    });
}

exports.exit = function (userId, groupId, cb) {
    Group.findById(groupId, function (err, group) {
        if (!group) {
            cb(new BaseError('this group not exists ,groupId:%s', groupId));
        } else if(group.founder == userId){
            cb(new BaseError('you can not exit this group because you are founder'));
        }else{
            Group.findByIdAndUpdate(groupId, {$pull: {members: userId}}, cb);
        }
    });
}

exports.editGroup = function (userId,group, cb) {
	if(group.id){
		Group.findById(group.id,function(err,mgroup){
			editGroupCallBack(err,mgroup,group,cb);
		});
	}else if(group.refId){
		Group.findOne({refId : group.refId},function(err,mgroup){
			editGroupCallBack(err,mgroup,group,cb);
		})
	}else{
		cb(new BaseError('need id or refId'));
	}
}

function editGroupCallBack(err,mgroup,group,cb){
	if(err){
	   cb(err);
	}else if(!mgroup) {
		cb(new BaseError('this group not exists ,id:%s', group.id || group.refId));
	} else {
		if(group.name){
			mgroup.name = group.name;
			mgroup.letterName = letter(group.name);
		}
		if(group.profilePhoto){
			mgroup.profilePhoto = group.profilePhoto;
		}

		mgroup.save(cb);
	}
}

exports.findGroupsAboutUser = function(userId,cb){
    Group.find({members : {$all : [userId]}}).populate({
        path : 'founder members',
        select : 'nickName profilePhoto sex letterName'
    }).exec(function(err,groups){
        if(err){
            cb(err);
        }else{
            cb(null,groups);
        }
    });
}

function createValidate(group, cb) {
	if(!group.refId){
		cb(new BaseError('need refId'));
		return false;
	}
    if (!group.orgId) {
        cb(new BaseError('need orgId'));
        return false;
    }
    if (!group.name) {
        cb(new BaseError('need group name'));
        return false;
    }
    if (!group.founder && !group.founderRefId) {
        cb(new BaseError('need group founder or founderRefId'));
        return false;
    }
    return true;
}


