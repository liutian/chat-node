require('../../app/schema/GMessageSchema.js');
require('../../app/schema/GroupSchema.js');
require('should');
var mongoose = require('mongoose')
    , gmessageService = require('../../app/service/GMessageService.js');


describe('群聊相关的接口', function () {

    it('发送群聊', function (done) {
        gmessageService.send({
            content : '是ss多少收到',
            from : '5316f2e7d01fc1d8187fb44c',
            to : '5316fd37e2ec20dc19bc1172',
            orgId : 111
        }, done);
    });

})





