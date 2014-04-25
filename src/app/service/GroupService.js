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
		_create(group,cb);
	}else{
		Group.findOne({refId : group.refId,orgId : group.orgId},'name',function(err,mgroup){
			 if(err){
				 cb(err);
			 }else if(mgroup){
				 cb(new BaseError('this group exists already founderRefId:%s  orgId:%s',group.founderRefId,group.orgId));
			 }else{
				 _create(group,cb);
			 }
		});
	}
}

exports.edit = function (group, cb) {
	if(!groupValidate(group,cb)) return;

	if(group.founder){
		_edit(group.founder,group,cb);
	}else if(group.founderRefId == -1){
		_edit(group.founderRefId,group,cb);
	}else{
		User.findOne({refId : group.founderRefId},'loginName',function(err,user){
			if(err){
				cb(err);
			}else if(!user){
				cb(new BaseError('this user not exists refId:%s',group.founderRefId));
			}else{
				_edit(user.id,group,cb);
			}
		});
	}
}

exports.disband = function (group, cb) {
	if(!groupValidate(group,cb)) return;

	if(group.founder){
		_disband(group.founder,group,cb);
	}else if(group.founderRefId == -1){
		_disband(group.founderRefId,group,cb);
	}else{
		User.findOne({refId : group.founderRefId},'loginName',function(err,user){
			if(err){
				cb(err);
			}else if(!user){
				cb(new BaseError('this user not exists refId:%s',group.founderRefId));
			}else{
				_disband(user.id,group,cb);
			}
		});
	}
}

exports.join = function (userId,userRefId,group, cb) {
	if(userId){
		_join(userId,group,cb);
	}else{
		User.findOne({refId : userRefId},'loginName',function(err,user){
			if(err){
				cb(err);
			}else if(!user){
				cb(new BaseError('this user not exists refId:%s',userRefId));
			}else{
				_join(user.id,group,cb);
			}
		});
	}
}

exports.exit = function (userId,userRefId, group, cb) {
	if(userId){
		_exit(userId,group,cb);
	}else{
		User.findOne({refId : userRefId},'loginName',function(err,user){
			if(err){
				cb(err);
			}else if(!user){
				cb(new BaseError('this user not exists refId:%s',userRefId));
			}else{
				_exit(user.id,group,cb);
			}
		});
	}
}

exports.clearGroupMember = function(refId,orgId,cb){
	Group.findOneAndUpdate({refId : refId,orgId : orgId},{$set : {members : []}},cb);
}

exports.handOver = function(group,cb){
	if(group.oldFounder){
		User.findById(group.oldFounder,function(err,oldUser){
			if(err){
				cb(err);
			}else if(!oldUser){
				cb(new BaseError('this user not find oldFounder:%s',group.oldFounder));
			}else{
				User.findById(group.newFounder,function(err,newUser){
					if(err){
						cb(err);
					}else if(!newUser){
						cb(new BaseError('this user not find newFounder:%s',group.newFounder));
					}else{
						handOverCallBack(oldUser,newUser,group,cb);
					}
				});
			}
		});
	}else{
		User.findOne({refId : group.oldFounderRefId},function(err,oldUser){
			if(err){
				cb(err);
			}else if(!oldUser){
				cb(new BaseError('this user not find oldFounderRefId:%s',group.oldFounderRefId));
			}else{
				User.findOne({refId : group.newFounderRefId},function(err,newUser){
					if(err){
						cb(err);
					}else if(!newUser){
						cb(new BaseError('this user not find newFounderRefId:%s',group.newFounderRefId));
					}else{
						handOverCallBack(oldUser,newUser,group,cb);
					}
				});
			}
		});
	}
}

function handOverCallBack(oldUser,newUser,group,cb){
	var updater = {
		founder : newUser.id,
		founderRefId: newUser.refId,
		$addToSet:{
			members : newUser.id
		}
	}

	if(group.id){
		Group.findOne({_id : group.id,founder : oldUser.id},function(err,mgroup){
			if(err){
				cb(err);
			}else if(!mgroup){
				cb(new BaseError('you have not right to hand over this group id:%s',group.id));
			}else{
				Group.findByIdAndUpdate(mgroup.id,updater,cb);
			}
		});
	}else{
		Group.findOne({refId : group.refId,orgId : group.orgId,founder : oldUser.id},function(err,mgroup){
			if(err){
				cb(err);
			}else if(!mgroup){
				cb(new BaseError('you have not right to hand over this group refId:%s orgId:%s',group.refId,group.orgId));
			}else{
				Group.findByIdAndUpdate(mgroup.id,updater,cb);
			}
		});
	}
}

function _create(group,cb){
	if(group.founder){
		createCallBack(group.founder,group,cb);
	}else{
		User.findOne({refId : group.founderRefId,orgId : group.orgId},'loginName',function(err,user){
			if(err){
				cb(err);
			}else if(!user){
				cb(new BaseError('this user not find refId:%s',group.founderRefId));
			}else{
				createCallBack(user.id,group,cb);
			}
		});
	}
}

function createCallBack(founder,group,cb){
	group.founder = founder;
	group.letterName = letter(group.name);
	if(_.isArray(group.members)){
		group.members.push(founder);
	}else{
		group.members = [founder];
	}

	Group.create(group,cb);
}

function groupValidate(group,cb){
	if(!group.id && !group.refId){
		cb(new BaseError('need id or refId'));
		return false;
	}
	if(!group.founder && !group.founderRefId){
		cb(new BaseError('need founder or founderRefId'));
		return false;
	}
	if(group.founderRefId && !group.orgId){
		cb(new BaseError('need orgId'));
		return false;
	}
	return true;
}

function _edit(userId,group,cb){
	if(group.id){
		var conditions = {_id : group.id};
		if(userId != -1) conditions.founder = userId;

		Group.findOne(conditions,function(err,mgroup){
			editGroupCallBack(err,mgroup,group,cb);
		});
	}else if(group.refId){
		var conditions = {refId : group.refId,orgId : group.orgId};
		if(userId != -1) conditions.founder = userId;

		Group.findOne(conditions,function(err,mgroup){
			editGroupCallBack(err,mgroup,group,cb);
		});
	}
}

function _join(userId,group,cb){
	if(group.id){
		Group.findByIdAndUpdate(group.id, {$addToSet: {members: userId}}, cb);
	}else if(group.orgId && group.refId){
		Group.findOneAndUpdate({refId : group.refId,orgId : group.orgId}, {$addToSet: {members: userId}}, cb);
	}else{
		cb(new BaseError('need id or (refId and orgId)'))
	}
}

function _disband(userId,group,cb){
	if(group.id){
		var conditions = {_id : group.id};
		if(userId != -1) conditions.members = userId;

		Group.findOne(conditions,'founder',function(err,mgroup){
			disbandCallBack(err,mgroup,userId,cb);
		});
	}else if(group.refId){
		var conditions = {refId : group.refId,orgId : group.orgId};
		if(userId != -1) conditions.members = userId;

		Group.findOne(conditions,'founder',function(err,mgroup){
			disbandCallBack(err,mgroup,userId,cb);
		});
	}
}

function _exit(userId,group,cb){
	if(group.id){
		Group.findByIdAndUpdate(group.id, {$pull: {members: userId}}, cb);
	}else if(group.refId && group.orgId){
		Group.findOneAndUpdate({refId : group.refId,orgId : group.orgId}, {$pull: {members: userId}}, cb);
	}else{
		cb(new BaseError('need id or (refId and orgId)'))
	}
}

function disbandCallBack(err,mgroup,userId,cb){
	if(err){
		cb(err);
	}else if(!mgroup){
		cb(new BaseError('this group not exists groupId:%s', groupId));
	}else if (mgroup.founder != userId) {
		cb(new BaseError('you have no right to delete this group , userId:%s groupId:%s', userId, groupId));
	} else {
		mgroup.remove(cb);
	}
}

function editGroupCallBack(err,mgroup,group,cb){
	if(err){
	   cb(err);
	}else if(!mgroup) {
		cb(new BaseError('this group not exists or you have no right ,id:%s', group.id || group.refId));
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

function createValidate(group, cb) {
    if (!group.name) {
        cb(new BaseError('need group name'));
        return false;
    }
    if (!group.founder && !group.founderRefId) {
        cb(new BaseError('need group founder or founderRefId'));
        return false;
    }
	if(group.founderRefId && (!group.refId ||  !group.orgId)){
		cb(new BaseError('need orgId and orgId'));
		return false;
	}
    return true;
}


