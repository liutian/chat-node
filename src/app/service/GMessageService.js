var mongoose = require('mongoose')
	, _ = require('underscore')
	, BaseError = require('../common/BaseError.js');


var GMessage = mongoose.model('gmessage');
var Group = mongoose.model('group');

exports.send = function (gmessage, cb) {
	if (!validateGMessage(gmessage, cb)) return;

	if (gmessage.to) {
		Group.findById(gmessage.to, function (err, group) {
			_send(err, group, cb);
		});
	} else {
		Group.find({refId: gmessage.refId, orgId: gmessage.orgId}, function (err, group) {
			_send(err, group, cb);
		});
	}

}

function _send(err, group, cb) {
	if (err) {
		cb(err);
	} else if (!group) {
		cb(new BaseError('this group not exists groupId:%s', gmessage.to));
	} else {
		var mSMessage = new GMessage(gmessage);
		var isMember = false;
		for (var i = 0; i < group.members.length; i++) {
			if (group.members[i] == gmessage.from) {
				isMember = true;
			} else {
				mSMessage.unread.push(group.members[i]);
			}
		}
		if (!isMember) {
			cb(new BaseError('You are not members of the group , userId:%s groupId:%s', gmessage.from, gmessage.to));
			return;
		}
		mSMessage.contentText = mSMessage.content;
		mSMessage.save(cb);
	}
}

exports.findNewMessage = function (userId, orgId, cb) {
	GMessage.find({orgId: orgId, unread: {$all: [userId]}}, '-unread').sort('-createDate').exec(function (err, messages) {
		if (err) {
			cb(err);
			return;
		} else if (!messages || messages.length == 0) {
			cb(null, []);
			return;
		}

		var _newMessages = {};
		var newMessage = [];
		for (var i = 0; i < messages.length; i++) {
			var message = messages[i];
			if (!_newMessages.hasOwnProperty(message.to)) {
				var newMsg = message.toJSON();
				newMsg.unreadCount = 1;
				_newMessages[newMsg.to] = newMsg;
			} else {
				_newMessages[newMsg.to].unreadCount++;
			}
		}
		_.forEach(_newMessages, function (val) {
			newMessage.push(val);
		});
		cb(null, newMessage);
	});
}

exports.findUnreadMessages = function (userId, groupId, orgId, cb) {
	GMessage.find({to: groupId, unread: {$all: userId}, orgId: orgId}, '-unread')
		.sort('createDate').exec(function (err, messages) {
			GMessage.update({to: groupId, unread: {$all: userId}, orgId: orgId}
				, {$pull: {unread: userId}}, {multi: true}, function () {
					cb(err, messages);
				});
		});
}

function validateGMessage(gmessage, cb) {
	if (!gmessage.content || gmessage.content.length == 0) {
		cb(new BaseError('gmessage need content'));
		return false;
	}
	if (!gmessage.from) {
		cb(new BaseError('gmessage need from'));
		return false;
	}
	if (!gmessage.to && !gmessage.refId) {
		cb(new BaseError('gmessage need to'));
		return false;
	}
	if (!gmessage.orgId) {
		cb(new BaseError('gmessage need orgId'));
		return false;
	}
	return true;
}
