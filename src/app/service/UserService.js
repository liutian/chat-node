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
 * }
 * @param cb
 */
exports.signUp = function (user, cb) {
    var mUser = new User(user);

    if (!user.orgId) {
        cb(new BaseError('need orgId'));
        return false;
    }

    if (!userValid(user, cb)) {
        return;
    }

    User.findOne({loginName: mUser.loginName}, 'loginName', function (err, data1) {
        if (data1) {
            var suffix = '-' + StringUtil.randomLetters(3);
            User.findOne({loginName: mUser.loginName + suffix}, 'loginName', function (data2) {
                if (data2) {
                    cb(new BaseError('this loginName conflict'));
                } else {
                    mUser.loginName += suffix;
                    saveUser();
                }
            });
        } else {
            saveUser();
        }
    });

    function saveUser() {
        var md5 = crypto.createHash('md5');
        md5.update(mUser.pwd);
        mUser.pwd = md5.digest('hex');

        if(!mUser.nickName) mUser.nickName = mUser.loginName;
        mUser.letterName = letter(mUser.nickName);

        mUser.save(function (err) {
            if (err) {
                cb(err);
            } else {
                cb(err, mUser);
            }
        });
    }
}
/**
 * @param user
 * {
 *  orgId : Number,
 *  loginName : String,
 *  pwd : String
 * }
 * @param cb
 */
exports.loginIn = function (user, cb) {
    if (!userValid(user,cb)) {
        return;
    }

    User.findOne({loginName: user.loginName}, function (err, data) {
        if (err || !data) {
	        cb(new BaseError('loginName invalid'));
	        return;
        }
        var md5 = crypto.createHash('md5');
        md5.update(user.pwd);
        var pwdMd5 = md5.digest('hex');
        if (pwdMd5 == data.pwd) {
            cb(null,{id : data.id,orgId : data.orgId});
        } else {
            cb(new BaseError('password invalid'));
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
    } else {
        cb(new BaseError('user must have id or loginName'));
        return;
    }

    User.findOne(queryData,function(err,data){
        if(!data){
            cb(new BaseError('not find user'));
            return;
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