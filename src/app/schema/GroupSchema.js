var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var GroupSchema = new Schema({
	refId : {type : Number,required : true},
	profilePhoto : {type : String},
    name : {type : String,required : true},
    letterName : {type : String,required: true,lowercase:true},
    founder : {type : Schema.Types.ObjectId,ref : 'user',require : true},
	founderRefId : {type : Number,required : true},
    members : [{type : Schema.Types.ObjectId ,ref : 'user'}],
    createDate : {type : Date , default : Date.now},
    orgId : {type : Number ,required : true}
});

mongoose.model('group', GroupSchema);




