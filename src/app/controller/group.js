var groupService = require('../service/GroupService'),
	log4js = require('log4js'),
	_ = require('underscore'),
	ctrlUtil = require('../common/ControllerUtil');

var logger = log4js.getLogger();

module.exports = function(app){
	/**
	 * refId,orgId,founderRefId,name,profilePhoto
	 */
	app.post('/trust-api/createGroup',function(req,res){
		groupService.create(req.body,function(err){
			ctrlUtil.process(res,err,logger);
		});
	});

	/**
	 *  refId,founderRefId,orgId,name,profilePhoto
	 */
	app.post('/trust-api/editGroup',function(req,res){
		groupService.edit(req.body,function(err){
			ctrlUtil.process(res,err,logger);
		});
	});

	/**
	 *  refId,founderRefId,orgId
	 */
	app.post('/trust-api/disbandGroup',function(req,res){
		groupService.disband(req.body,function(err){
			ctrlUtil.process(res,err,logger);
		});
	});

	/**
	 *  orgId,refId,userId
	 */
	app.post('/trust-api/joinGroup',function(req,res){
		groupService.join(null,req.body.userId,req.body,function(err){
			ctrlUtil.process(res,err,logger);
		});
	});

	/**
	 * orgId,refId,userId
	 */
	app.post('/trust-api/exitGroup',function(req,res){
		var currUserId = req.body.currUserId;
		groupService.exit(null,req.body.userId,req.body,function(err){
			ctrlUtil.process(res,err,logger);
		});
	});

}