var socketIO = require('socket.io'),
	express = require('./express'),
	cookie = require('../../node_modules/express/node_modules/cookie'),
	utils = require('../../node_modules/express/node_modules/connect/lib/utils');

module.exports = function (server) {
	var io = socketIO.listen(server);

	io.set('authorization', function (handshakeData, callback) {
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
	});

	io.sockets.on('connection', function (socket) {
		saveSockets(socket.id);
		socket.on('my other event', function (data) {

		});
	});

	function saveSockets(socketId) {
		if (!global.appData.socketIO) {
			global.appData.socketIO = {sockets: {}};
		}

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
					if(!io.transports[_socketId] || !io.transports[_socketId].open){
						console.log('splice ' + j + ' id:' + _sockets[sess.user.id][j]);
						_sockets[sess.user.id].splice(j,1);
						j--;
					}
				}

				if(_sockets[sess.user.id].indexOf(socketId) == -1){
					_sockets[sess.user.id].unshift(socketId);
				}
			}
		});
	}
}

