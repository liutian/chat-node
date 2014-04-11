express = require('express');

module.exports = function(app){
	var multipartMiddleware = express.multipart({uploadDir : 'e:/tmp/uploaddir'});
	app.post('/api/upload',multipartMiddleware,function(req,res,next){
		if(req.files && req.files.fileUpload){
			console.log('fileupload success');
			res.json({code : 10000});
		}else{
			console.log('fileupload fail');
			res.json({code : 10001});
		}
	});
}