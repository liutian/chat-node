var JPush = require('jpush-sdk'),
	_ = require('underscore');

var jpushClient = JPush.build({appkey: global.prop.jpush.appkey, masterSecret: global.prop.jpush.masterSecret});

module.exports = function(sendno,alias,title,content,cb){
	var receiver = {};
	receiver.type = jpushClient.pushType.alias;
	receiver.value = alias;
	var msg = {};
	msg.content = {
		n_title: title || '',
		n_content : ''
	};

	if(_.isString(content)){
		msg.content.n_content = content || '';
	}else if(_.isObject(content)){
		msg.content.n_content = content.message || '';
		msg.content.n_extras = content.n_extras;
	}

	msg.type = 1;
	msg.platform = jpushClient.platformType.both;
	jpushClient.pushNotification(sendno, receiver, msg, cb);
}