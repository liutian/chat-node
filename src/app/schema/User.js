/**
 * Created with JetBrains WebStorm.
 * User: liuss
 * Date: 13-8-25
 * Time: 下午2:55
 * To change this template use File | Settings | File Templates.
 */
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var TeamSchema = new Schema({
    name : String,
    members : [
        {
            id : Schema.Types.ObjectId,
            nickName : String,
            profilePhoto : String
        }
    ]
});

var UserSchema = new Schema({
    nickName : String,
    token : String,
    secretKey : String,
    profilePhoto : String,
    letterName : String,
    teams : [TeamSchema],
    groups : [{
        id : Schema.Types.ObjectId,
        name : String
    }],
    createDate : {type : Date , default : Date.now}
},{collection : 'user'});




mongoose.model('User', UserSchema);




