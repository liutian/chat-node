require('../../app/schema/SMessageSchema.js');
require('should');
var mongoose = require('mongoose')
    , smessageService = require('../../app/service/SMessageService.js');


describe('私聊相关的接口', function () {

    it('发送私聊', function (done) {
        smessageService.send({
            content : 'sd',
            from : '5315a4c4d031dc541abf0eba',
            to : '5315fb1515b5c1081a5f380f'
        }, done);
    });

})





