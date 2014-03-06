require('../../app/schema/SMessageSchema.js');
require('should');
var mongoose = require('mongoose')
    , smessageService = require('../../app/service/SMessageService.js');


describe('私聊相关的接口', function () {

    it.skip('发送私聊', function (done) {
        smessageService.send({
            content : '34方法111的',
            from : '5317228bb538541c1337b16d',
            to : '5316f30fa32deacc1e99ec80',
            orgId : 1111
        }, done);
    });

    it.skip('接收私聊未读信息',function(done){
        smessageService.findNewMessage('5316f30fa32deacc1e99ec80',1111,function(err,messages){
            if(err){
                done(err);
            }else{
                console.log(messages);
                messages.should.not.be.empty;
                done();
            }
        });
    });

    it.skip('获取对应用户的未读消息',function(done){
        smessageService.findUnreadMessages('5316f2e7d01fc1d8187fb44c','5316f30fa32deacc1e99ec80',1111,function(err,messages){
            if(err){
                done(err);
            }else{
                console.log(messages);
                messages.should.not.be.empty;
                done();
            }
        });
    });

})





