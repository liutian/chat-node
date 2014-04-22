var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var GroupSchema = new Schema({
	refId : Schema.Types.Mixed,
	profilePhoto : String,
    name : {type : String,required : true},
    letterName : {type : String,required: true,lowercase:true},
    founder : {type : Schema.Types.ObjectId,ref : 'user',required : true},
	founderRefId : Schema.Types.Mixed,
    members : [{type : Schema.Types.ObjectId ,ref : 'user'}],
    createDate : {type : Date , default : Date.now},
    orgId : Schema.Types.Mixed
});

mongoose.model('group', GroupSchema);




