/**
 * Created with JetBrains WebStorm.
 * User: liuss
 * Date: 13-8-25
 * Time: 下午3:54
 * To change this template use File | Settings | File Templates.
 */
var mongoose = require('mongoose')
  , uuid = require('node-uuid')
  , crypto = require('crypto')
  , letter = require('../util/letter.js')
  , log4js = require('log4js')
  , _ = require('underscore');


var User = mongoose.model('User');
var logger = log4js.getLogger('rlog');

/**
 * @param user
 * {
 *  nickName : String,
 *  profilePhoto : String,
 *  pwd : String
 * }
 * @param cb
 */
exports.registerUser = function(user,cb){

    var mUser = new User();
    var md5 = crypto.createHash('md5');

    md5.update(user.pwd);

    mUser.nickName = user.nickName;
    mUser.profilePhoto = user.profilePhoto;
    mUser.token = uuid.v1();
    mUser.secretKey = md5.digest('hex');
    mUser.letterName = letter(user.nickName);

    mUser.save(function(err){
        if(err){
            logger.error('registerUser : save user error' + err);
            cb(err);
        }else{
            cb(err,mUser);
        }
    });
}

exports.loginValidUser = function(user,cb){
    User.findById(user.id,function(err,udata){
        if(err) cb(false);
        if(udata.token == user.token && udata.secretKey == user.secretKey){
            cb(true);
        }
    });
}

exports.editUser = function(user,cb){
    if(_.isNull(user) || _.isUndefined(user.id)) {
        cb(new Error('user args not allow null'));
        return;
    }
    var updateData = {};
    if(user.nickName){
        updateData.nickName = letter(user.nickName);
    }

    if(user.profilePhoto) {
        updateData.profilePhoto = user.profilePhoto;
    }

    User.findByIdAndUpdate(user.id,{$set : updateData},function(err){
        cb(err);
    })
}
