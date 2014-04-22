var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var UserSchema = new Schema({
	refId : Schema.Types.Mixed,
    loginName : {type : String,required : true},
    nickName : {type : String,required : true},
    pwd : {type : String,required : true},
    profilePhoto : String,
    sex : {
        type : String,
        enum : ['w','m'],
        default : 'm'
    },
    letterName : {type : String,required : true,lowercase:true},
    orgId : Schema.Types.Mixed,
    teams : [{
        name : String,
        members : [{type : Schema.Types.ObjectId, ref : 'user'}]
    }],
    groups : [{type : Schema.Types.ObjectId ,ref : 'group'}],
    createDate : {type : Date , default : Date.now},
	whisperSession : Schema.Types.Mixed,
	whisperSessionUnreadCount : Schema.Types.Mixed,
	groupSession : Schema.Types.Mixed,
	groupSessionUnreadCount : Schema.Types.Mixed
});

mongoose.model('user', UserSchema);




