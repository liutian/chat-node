exports.whisper = function(userId,data,cb){
	var _sockets = global.appData.socketIO.sockets[userId];
	var io = global.appData.socketIO.io;
	var bool = false;

	exports.iteratorSockets(_sockets,function(socketId){
		bool = true;
		io.sockets.sockets[socketId].emit('whisper',data);
	});

	if(bool){
		cb && cb({code : 10000});
	}else{
		cb && cb({code : 10000,msg : 'current socket have problems ,can not send whisper outside'});
	}
}

exports.groupChat = function(groupId,selfUserId,data,cb){
	var _sockets = global.appData.socketIO.sockets[selfUserId];
	var io = global.appData.socketIO.io;
	var bool = false,isInRoom = false;

	for(var i = 0;i < _sockets.length;i++){
		if(io.sockets.manager.roomClients[_sockets[i]]['/' + groupId]){
			isInRoom = true;
			break;
		}
	}

	if(!isInRoom){
		cb && cb({code : 10001,msg : 'not in this room :' + groupId});
		return;
	}

	exports.iteratorSockets(_sockets,function(socketId){
		if(!bool){
			io.sockets.setFlags();
			io.sockets.in(groupId);
			bool = true;
		}
		io.sockets.except(socketId);
	});

	if(bool){
		io.sockets.emit('groupChat',data);
		cb && cb({code : 10000});
	}else{
		cb && cb({code : 10000,msg : 'current socket have problems ,can not send groupChat outside'});
	}
}

exports.iteratorSockets = function(sockets,cb){
	var io = global.appData.socketIO.io;

	if(sockets && sockets.length > 0){
		for(var i = 0;i < sockets.length;i++){
			var _socketId = sockets[i];
			if(!io.sockets.sockets[_socketId]){
				sockets.splice(i,1);
				i--;
			}else{
				cb(_socketId);
			}
		}
	}
}