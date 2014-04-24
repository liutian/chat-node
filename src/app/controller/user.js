var userService = require('../../app/service/UserService.js'),
	BaseError = require('../common/BaseError'),
	log4js = require('log4js'),
	ctrlUtil = require('../common/ControllerUtil');

var logger = log4js.getLogger();

module.exports = function(app){

	/**
	 * refId,orgId,loginName,pwd,[nickName],[profilePhoto],[sex]
	 */
	app.post('/trust-api/signUp',function(req,res){
		var orgId = req.body.orgId;
		var refId = req.body.refId;

		if (!orgId) {
			res.json({code : 10001,msg : 'need orgId'});
			return;
		}

		if (!refId) {
			res.json({code : 10001,msg : 'need refId'});
			return;
		}

		userService.signUp(req.body,function(err){
			ctrlUtil.process(res,err,logger);
		});
	});

	app.post('/signIn', function(req, res){
		userService.signIn(req.body,function(err,udata){
			if(err){
				logger.error(err);
				delete req.session.user;
				res.json({code : 10001,msg : err.message});
			}else{
				req.session.user = udata;
				res.json({code : 10000});
			}
		});
	});

	app.get('/api/historySession',function(req,res){
		userService.getAllHistorySession(req.session.user.id,function(err,sessions){
			ctrlUtil.processToData(sessions,res,err,logger);
		});
	});

	/**
	 *  refId,[delFlag],[lockFlag],[pwd],[nickName],[profilePhoto],[sex]
	 */
	app.post('/trust-api/editUser',function(req,res){
		var refId = req.body.refId;

		if (!refId) {
			res.json({code : 10001,msg : 'need refId'});
			return;
		}

		userService.editUser(req.body,function(err){
			ctrlUtil.process(res,err,logger);
		});
	});

}


