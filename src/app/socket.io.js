var socketIO = require('socket.io'),
	express = require('./express'),
	socketHandler = require('./webSocket/socketHandler'),
	cookie = require('../../node_modules/express/node_modules/cookie'),
	utils = require('../../node_modules/express/node_modules/connect/lib/utils');

module.exports = function (server) {
	var io = socketIO.listen(server);

	global.appData.socketIO = {sockets: {}, io: io};

	io.set('authorization', socketHandler.authorizationHandler);

	io.sockets.on('connection', function (socket) {
		saveSockets(socket,io);

		socket.on('whisper', function (data, cb) {
			socketHandler.whisperHandler(socket, data, cb);
		});

		socket.on('groupChat', function (data, cb) {
			socketHandler.groupChatHandler(socket, data, cb);
		});

		socket.on('broadcast', function (data) {
			socket.broadcast.emit('broadcast', data);
		});
	});

}

function saveSockets(socket,io) {
	var socketId = socket.id;
	var _sockets = global.appData.socketIO.sockets;

	if (!io.handshaken[socketId]) return;

	var cookies = cookie.parse(io.handshaken[socketId].headers.cookie);
	var signedCookies = utils.parseSignedCookies(cookies, "liuss123");
	signedCookies = utils.parseJSONCookies(signedCookies);

	if (!signedCookies.sid) return;

	express.sessionStore.get(signedCookies.sid, function (err, sess) {
		if (!err && sess && sess.user) {
			if (!_sockets[sess.user.id]) {
				_sockets[sess.user.id] = [];
			}

			for (var j = 0; j < _sockets[sess.user.id].length; j++) {
				var _socketId = _sockets[sess.user.id][j];
				if (!io.sockets.sockets[_socketId]) {
					_sockets[sess.user.id].splice(j, 1);
					j--;
				}
			}

			if (_sockets[sess.user.id].indexOf(socketId) == -1) {
				_sockets[sess.user.id].unshift(socketId);
				socket.$$userId = sess.user.id;
				socket.$$orgId = sess.user.orgId;
			}
		}
	});
}
