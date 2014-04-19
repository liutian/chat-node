var mongoose = require('mongoose')
    , Schema = mongoose.Schema
    , AttachmentSchema = require('./AttachmentSchema.js');

var GMessageSchema = new Schema({
    content: {type: String, required: true},
    contentText: {type: String, required: true},
    attachment: [AttachmentSchema],
    unread : [Schema.Types.ObjectId],
    from: {type: Schema.Types.ObjectId, ref: 'user'},
    to: {type: Schema.Types.ObjectId, ref: 'group'},
    createDate : {type : Date,default : Date.now},
    orgId : {type : Number,required : true},
	type : {type : Number,enum : [0,1,2],default : 0},
	filePath : [String],
	fileName : String
});

mongoose.model('gmessage', GMessageSchema);




