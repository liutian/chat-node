var smessageService = require('../service/SMessageService.js'),
	gmessageService = require('../service/GMessageService.js'),
	webSocketService = require('./socketSender'),
	express = require('../express'),
	cookie = require('../../../node_modules/express/node_modules/cookie'),
	utils = require('../../../node_modules/express/node_modules/connect/lib/utils'),
	log4js = require('log4js'),
	JPush = require('jpush-sdk');

var logger = log4js.getLogger();
var jpushClient = JPush.build({appkey: global.prop.jpush.appkey, masterSecret: global.prop.jpush.masterSecret});
var sessionKey = global.appData.sessionKey;

exports.authorizationHandler = function(handshakeData, callback) {
	if (handshakeData.headers.cookie) {
		var cookies = cookie.parse(handshakeData.headers.cookie);
		var signedCookies = utils.parseSignedCookies(cookies, global.appData.cookieSecret);
		signedCookies = utils.parseJSONCookies(signedCookies);
		if (signedCookies[sessionKey]) {
			express.sessionStore.get(signedCookies[sessionKey], function (err, sess) {
				if (!err && sess && sess.user) {
					callback(null, true);
				} else {
					callback(null, false);
				}
			});
		} else {
			callback(null, false);
		}
	} else {
		callback(null, false);
	}
}

exports.groupChatHandler = function(socket, data, cb) {
	var io = global.appData.socketIO.io;

	if (!data.type || !data.to) {
		cb && cb({code: 10001, msg: 'need type and to'});
		return;
	}

	if (data.type == 'join' || data.type == 'leave' || data.type == 'message') {
		if (!socket.$$sessionUser || !socket.$$sessionUser.id) {
			cb && cb({code: 10001, msg: 'current socket have no $$sessionUser.id'});
			return;
		}

		if (data.type == 'message') {
			var message = {
				from : socket.$$sessionUser.id,
				fromRefId : socket.$$sessionUser.refId,
				fromNickName : socket.$$sessionUser.nickName,
				to : data.to,
				orgId : socket.$$sessionUser.orgId,
				content : data.content
			}

			gmessageService.send(message,function(err){
				if(err){
					logger.error(err);
					cb && cb({code : 10001,msg : 'save message error'});
					return;
				}

				webSocketService.groupChat(data.to, socket.$$sessionUser.id, data, cb);
				jpushClient.sendNotificationWithTag(global.prop.jpush.groupChatSendNo,message.to,'群聊',message.content,function(err,body){
					if(err){
						logger.error(err);
					}
				});
			});
		} else {
			var _sockets = global.appData.socketIO.sockets[socket.$$sessionUser.id];
			var bool = false;

			webSocketService.iteratorSockets(_sockets, function (socketId) {
				bool = true;
				io.sockets.sockets[socketId][data.type](data.to);
			});

			if(bool){
				cb && cb({code: 10000});
			}else{
				cb && cb({code: 10001,msg : 'current socket have problems ,can not ' + data.type + ' room '});
			}
		}
	}
}

exports.whisperHandler = function(socket, data, cb) {
	var message = {
		from : socket.$$sessionUser.id,
		fromRefId : socket.$$sessionUser.refId,
		fromNickName : socket.$$sessionUser.nickName,
		to : data.to,
		orgId : socket.$$sessionUser.orgId,
		content : data.content
	}

	smessageService.send(message, function (err) {
		if (err) {
			logger.error(err);
			cb && cb({code: 10001, msg: 'save message error'});
			return;
		}

		webSocketService.whisper(data.to, data,cb);
		jpushClient.sendNotificationWithAlias(global.prop.jpush.whisperSendNo,message.to,'私聊',message.content,function(err,body){
			if(err){
				logger.error(err);
			}
		});
	});

}

