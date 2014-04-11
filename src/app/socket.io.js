var socketIO = require('socket.io'),
	express = require('./express'),
	cookie = require('../../node_modules/express/node_modules/cookie'),
	utils = require('../../node_modules/express/node_modules/connect/lib/utils');

module.exports = function(server){
	var io = socketIO.listen(server);

	io.set('authorization',function(handshakeData, callback){
		if(handshakeData.headers.cookie){
			var cookies = cookie.parse(handshakeData.headers.cookie);
			var signedCookies = utils.parseSignedCookies(cookies, "liuss123");
			signedCookies = utils.parseJSONCookies(signedCookies);
			if(signedCookies.sid){
				console.log('websocket handshakedata sid:' + signedCookies.sid);
				express.sessionStore.get(signedCookies.sid,function(err, sess){
					if(!err && sess && sess.user){
						console.log('websocket handshake success');
						callback(null,true);
					}else{
						console.log('websocket handshake error');
						callback(null,false);
					}
				});
			}else{
				console.log('websocket handshake error');
				callback(null,false);
			}
		}else{
			console.log('websocket handshake error');
			callback(null,false);
		}
	});

	io.sockets.on('connection',function(socket){
		socket.on('my other event',function(data){
			console.log('has data:' + data);
		});
	});
}

