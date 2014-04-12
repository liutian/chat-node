express = require('express');

module.exports = function(app){
	var multipartMiddleware = express.multipart({uploadDir : 'e:/tmp/uploaddir'});
	app.post('/api/upload',multipartMiddleware,function(req,res,next){
		if(req.files && req.files.fileUpload){
			res.json({code : 10000});
		}else{
			res.json({code : 10001});
		}
	});
}