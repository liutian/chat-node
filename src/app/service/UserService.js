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

	if (!user.orgId) {
		cb(new BaseError('need orgId'));
		return;
	}

	if (!user.refId) {
		cb(new BaseError('need refId'));
		return;
	}

    User.findOne({$or : [{loginName: user.loginName},{refId : user.refId}]}, function (err, muser) {
        if(err){
	        cb(err);
        }else if (muser) {
	        cb(new BaseError('loginName ,refId conflict'));
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
		var historySession = {
			session : user.whisperSession || {},
			unreadCount : user.whisperSessionUnreadCount || {}
		};

		cb(err,historySession);
	});
}

exports.getGHistorySession = function(userId,cb){
	User.findById(userId,function(err,user){
		var historySession = {
			session : user.groupSession || {},
			unreadCount : user.groupSessionUnreadCount || {}
		};

		cb(err,historySession);
	});
}

exports.getAllHistorySession = function(userId,cb){
	exports.getSHistorySession(userId,function(err,sSession){
		if(!err){
			exports.getGHistorySession(userId,function(err,gSession){
				if(!err){
					cb(null,wrapSession(sSession,gSession));
				}else{
					cb(err);
				}
			});
		}else{
			cb(err);
		}
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
    var queryData = {};
    if (user.id) {
        queryData.id = user.id;
    } else if (user.loginName) {
        queryData.loginName = user.loginName;
    } else if(user.refId){
        queryData.refId = user.refId;
    } else{
        cb(new BaseError('user must have id or loginName or refId'));
        return;
    }

    User.findOne(queryData,function(err,data){
        if(!data){
            cb(new BaseError('not find user'));
            return;
        }

	    if(user.pwd){
		    var md5 = crypto.createHash('md5');
		    md5.update(user.pwd);
		    user.pwd = md5.digest('hex');
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

        data.save(function(err){
            cb(err);
        });
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
	_.each(sSession.session,function(value,key){
		value.id = key;
		value.isGroup = false;
		value.unreadCount = sSession.unreadCount[key] || 0;
		value.date = value.date ? value.date.getTime() : 0;
		sessionList.push(value);
	});

	_.each(gSession.session,function(value,key){
		value.id = key;
		value.isGroup = true;
		value.unreadCount = gSession.unreadCount[key] || 0;
		value.date = value.date ? value.date.getTime() : 0;
		sessionList.push(value);
	});

	sessionList.sort(function(a,b){
		return a.createDate > b.createDate ? 1 : -1;
	});

	return sessionList;
}