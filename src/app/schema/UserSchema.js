var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var UserSchema = new Schema({
	refId : {type : Number,required : true},
    loginName : {type : String,required : true},
    nickName : String,
    pwd : {type : String,required : true},
    profilePhoto : {type : String,required : true},
    sex : {
        type : String,
        enum : ['w','m'],
        default : 'm'
    },
    letterName : {type : String,required : true,lowercase:true},
    orgId : {type : Number,required : true},
    teams : [{
        name : String,
        members : [{type : Schema.Types.ObjectId, ref : 'user'}]
    }],
    groups : [{type : Schema.Types.ObjectId ,ref : 'group'}],
    createDate : {type : Date , default : Date.now}
});

mongoose.model('user', UserSchema);




