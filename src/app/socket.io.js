var socketIO = require('socket.io'),
	express = require('./express'),
	webSocketService = require('./webSocketService'),
	cookie = require('../../node_modules/express/node_modules/cookie'),
	utils = require('../../node_modules/express/node_modules/connect/lib/utils');

module.exports = function (server) {
	var io = socketIO.listen(server);

	global.appData.socketIO = {sockets: {},io : io};

	io.set('authorization', authorizationHandle);

	io.sockets.on('connection', function (socket) {
		saveSockets(socket);

		socket.on('whisper', function (data,cb) {
			webSocketService.whisper(data.toUserId,data);
			cb && cb({code : 10000});
		});

		socket.on('groupChat', function(data,cb){
			groupChatHandle(socket,data,cb);
		});

		socket.on('broadcast',function(data){
			socket.broadcast.emit('broadcast',data);
		});
	});

	function saveSockets(socket) {
		var socketId = socket.id;
		var _sockets = global.appData.socketIO.sockets;

		if (!io.handshaken[socketId]) return;

		var cookies = cookie.parse(io.handshaken[socketId].headers.cookie);
		var signedCookies = utils.parseSignedCookies(cookies, "liuss123");
		signedCookies = utils.parseJSONCookies(signedCookies);

		if (!signedCookies.sid) return;

		express.sessionStore.get(signedCookies.sid, function (err, sess) {
			if (!err && sess && sess.user) {
				if(!_sockets[sess.user.id]){
					_sockets[sess.user.id] = [];
				}

				for(var j = 0;j < _sockets[sess.user.id].length;j++){
					var _socketId = _sockets[sess.user.id][j];
					if(!io.sockets.sockets[_socketId]){
						_sockets[sess.user.id].splice(j,1);
						j--;
					}
				}

				if(_sockets[sess.user.id].indexOf(socketId) == -1){
					_sockets[sess.user.id].unshift(socketId);
					socket.$$userId = sess.user.id;
				}
			}
		});
	}

	function groupChatHandle(socket,data,cb) {
		if(!data.type || !data.groupId) {
			cb && cb({code : 10001,msg : 'need type and groupId'});
			return;
		}

		if(data.type == 'join' || data.type == 'leave' || data.type == 'message'){
			if(!socket.$$userId){
				cb && cb({code : 10001,msg : 'current socket have no $$userId'});
				return;
			}

			if(data.type == 'message'){
				webSocketService.groupChat(data.groupId,socket.$$userId,data,cb);
			}else{
				var _sockets = global.appData.socketIO.sockets[socket.$$userId];
				webSocketService.iteratorSockets(_sockets,function(socketId){
					io.sockets.sockets[socketId][data.type](data.groupId);
					cb && cb({code : 10000});
				});
			}
		}
	}

	function authorizationHandle (handshakeData, callback) {
		if (handshakeData.headers.cookie) {
			var cookies = cookie.parse(handshakeData.headers.cookie);
			var signedCookies = utils.parseSignedCookies(cookies, "liuss123");
			signedCookies = utils.parseJSONCookies(signedCookies);
			if (signedCookies.sid) {
				express.sessionStore.get(signedCookies.sid, function (err, sess) {
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
}

