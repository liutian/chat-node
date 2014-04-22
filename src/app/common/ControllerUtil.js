exports.process = function(res,err,logger){
	if(err){
		logger.error(err);
		res.json({code : 10001,msg : err.message});
	}else{
		res.json({code : 10000});
	}
}