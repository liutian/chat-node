var mongoose = require('mongoose')
    , crypto = require('crypto')
    , letter = require('../util/letter.js')
    , _ = require('underscore')
    , StringUtil = require('../util/StringUtil.js')
    , BaseError = require('../common/BaseError.js');


var User = mongoose.model('user');

/**
 * @param user
 * {
 *  orgId : String,
 *  loginName : String,
 *  pwd : String,
 *  nickName : String,
 *  profilePhoto : String,
 *  sex : String
 *  refId : Number
 * }
 * @param cb
 */
exports.signUp = function (user, cb) {
    if (!userValid(user, cb)) return;

	var conditions = {};
	if(user.refId){
		conditions.$or = [{loginName: user.loginName},{refId : user.refId}];
	}else{
		conditions.loginName = user.loginName;
	}

    User.findOne(conditions, function (err, muser) {
        if(err){
	        cb(err);
        }else if (muser) {
	        cb(new BaseError('loginName or refId conflict'));
        } else {
            saveUser(user,cb);
        }
    });

}

/**
 * @param user
 * {
 *  orgId : Number,
 *  loginName : String,
 * }
 * @param cb
 */
exports.signIn = function (user, cb) {
    if (!userValid(user,cb)) return;

    User.findOne({loginName: user.loginName}, function (err, data) {
        if(err){
	        cb(err);
	        return;
        }else if(!data){
	        cb(new BaseError('loginName invalid'));
	        return;
        }

        var md5 = crypto.createHash('md5');
        md5.update(user.pwd);
        var pwdMd5 = md5.digest('hex');
        if (pwdMd5 == data.pwd) {
            cb(null,{
	            id : data.id,
	            orgId : data.orgId,
	            refId : data.refId,
	            nickName : data.nickName,
	            profilePhoto : data.profilePhoto,
	            loginName : data.loginName
            });
        } else {
            cb(new BaseError('password invalid'));
        }
    });
}

exports.getSHistorySession = function(userId,cb){
	User.findById(userId,function(err,user){
		if(err){
			cb(err);
			return;
		}else if(!user){
			cb(new BaseError('this user not exists'));
			return;
		}

		var historySession = {
			session : user.whisperSession || {},
			unreadCount : user.whisperSessionUnreadCount || {}
		};

		cb(null,wrapSession(historySession,null));
	});
}

exports.getGHistorySession = function(userId,cb){
	User.findById(userId,function(err,user){
		if(err){
			cb(err);
			return;
		}else if(!user){
			cb(new BaseError('this user not exists'));
			return;
		}

		var historySession = {
			session : user.groupSession || {},
			unreadCount : user.groupSessionUnreadCount || {}
		};

		cb(null,wrapSession(null,historySession));
	});
}

exports.getAllHistorySession = function(userId,cb){
	User.findById(userId,function(err,user){
		if(err){
			cb(err);
			return;
		}else if(!user){
			cb(new BaseError('this user not exists'));
			return;
		}

		var gSession = {
			session : user.groupSession || {},
			unreadCount : user.groupSessionUnreadCount || {}
		};

		var sSession = {
			session : user.whisperSession || {},
			unreadCount : user.whisperSessionUnreadCount || {}
		};

		cb(null,wrapSession(sSession,gSession));
	});
}


/**
 * @param user
 * {
 *  id : ObjectId
 *  loginName : String,
 *  pwd : String,
 *  nickName : String,
 *  profilePhoto : String,
 *  sex : String
 * }
 * @param cb
 */
exports.editUser = function (user, cb) {
    var conditions = {};
    if (user.id) {
	    conditions.id = user.id;
    } else if (user.loginName) {
	    conditions.loginName = user.loginName;
    } else if(user.refId){
	    conditions.refId = user.refId;
    } else{
        cb(new BaseError('user must have id or loginName or refId'));
        return;
    }

    User.findOne(conditions,function(err,data){
        if(!data){
            cb(new BaseError('not find user'));
            return;
        }

	    if(user.pwd){
		    var md5 = crypto.createHash('md5');
		    md5.update(user.pwd);
		    data.pwd = md5.digest('hex');
	    }
        if (user.nickName) {
            data.nickName = user.nickName;
            data.letterName = letter(user.nickName);
        }
        if (user.profilePhoto) {
            data.profilePhoto = user.profilePhoto;
        }
        if (user.sex) {
            data.sex = user.sex;
        }
	    if(_.isNumber(user.delFlag)){
		    data.delFlag = user.delFlag;
	    }
	    if(_.isNumber(user.lockFlag)){
		    data.lockFlag = user.lockFlag;
	    }

        data.save(cb);
    });
}

exports.findAllUsers = function(orgId,cb){
    if(!_.isNumber(orgId)){
        cb(new BaseError('orgId must be a Number %s',orgId));
        return;
    }

    User.find({orgId : orgId},'nickName profilePhoto letterName',function(err,users){
        if(err){
            cb(err);
        }else{
            cb(null,users);
        }
    });
}

function userValid(user, cb) {
    if (!user.loginName || user.loginName.length <= 0) {
        cb(new BaseError('need loginName'));
        return false;
    }

    if (!user.pwd || user.pwd.length <= 0) {
        cb(new BaseError('need pwd'));
        return false;
    }

    return true;
}

function saveUser(user,cb) {
	var md5 = crypto.createHash('md5');
	md5.update(user.pwd);
	user.pwd = md5.digest('hex');

	if(!user.nickName) user.nickName = user.loginName;
	user.letterName = letter(user.nickName);
	if(!user.profilePhoto){
		if(user.sex == 'w'){
			user.profilePhoto = 'http://192.168.16.48:3000/images/woman.jpg';
		}else{
			user.profilePhoto = 'http://192.168.16.48:3000/images/man.jpg';
		}
	}

	User.create(user,function (err) {
		cb(err);
	});
}

function wrapSession(sSession,gSession){
	var sessionList = [];

	if(_.isArray(sSession)){
		_.each(sSession.session,function(value,key){
			value.id = key;
			value.isGroup = false;
			value.unreadCount = sSession.unreadCount[key] || 0;
			value.date = value.date ? value.date.getTime() : 0;
			sessionList.push(value);
		});
	}

	if(_.isArray(gSession)){
		_.each(gSession.session,function(value,key){
			value.id = key;
			value.isGroup = true;
			value.unreadCount = gSession.unreadCount[key] || 0;
			value.date = value.date ? value.date.getTime() : 0;
			sessionList.push(value);
		});
	}

	sessionList.sort(function(a,b){
		return a.createDate > b.createDate ? 1 : -1;
	});

	return sessionList;
}