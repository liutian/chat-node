var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

exports  = new Schema({
    name: {type: String, required: true},
    type: {
        type: String,
        enum: ['p', 'f'],
        required: true
    },
    path : {type : String,required : true},
    url: {type: String, required: true},
    size: Number,
    otherUrl: String,
    createDate : {type : Date,default : Date.now}
});





