require('../../app/schema/SMessageSchema.js');
require('should');
var mongoose = require('mongoose')
    , smessageService = require('../../app/service/SMessageService.js');


describe('私聊相关的接口', function () {

    it.skip('发送私聊', function (done) {
        smessageService.send({
            content : 'sd',
            from : '5316f3384951a8381ac91a40',
            to : '5316f36f2188eaa40acf7cf8',
            orgId : 111
        }, done);
    });

})





