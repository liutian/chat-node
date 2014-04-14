exports.whisper = function(userId,data){
	var _sockets = global.appData.socketIO.sockets[userId];
	var io = global.appData.socketIO.io;

	iteratorSockets(_sockets,function(socketId){
		io.sockets.sockets[socketId].emit('whisper',data);
	});
}

exports.groupChat = function(groupId,selfUserId,data){
	var _sockets = global.appData.socketIO.sockets[selfUserId];
	var io = global.appData.socketIO.io;
	var bool = false;

	iteratorSockets(_sockets,function(socketId){
		if(!bool){
			io.sockets.setFlags();
			io.sockets.in(groupId);
			bool = true;
		}
		io.sockets.except(socketId);
	});

	if(bool){
		io.sockets.emit('groupChat',data);
	}
}

function iteratorSockets(sockets,cb){
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