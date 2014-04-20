var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , AttachmentSchema = require('./AttachmentSchema.js');


var SMessageSchema = new Schema({
    content: {type: String, required: true},
    contentText: {type: String, required: true},
    attachment: [AttachmentSchema],
    read : {type : String,enum : ['y','n'],default:'n'},
    from: {type: Schema.Types.ObjectId, ref: 'user',required : true},
    to: {type: Schema.Types.ObjectId, ref: 'user',required : true},
    createDate : {type : Date,default : Date.now},
    orgId : {type : Number,required : true},
	type : {type : Number,enum : [0,1,2],default : 0},
	filePath : [String],
	fileName : String,
	sessionId : String
});

mongoose.model('smessage', SMessageSchema);




