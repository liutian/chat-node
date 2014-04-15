require('../../app/schema/GMessageSchema.js');
require('../../app/schema/GroupSchema.js');
require('should');
var mongoose = require('mongoose')
    , gmessageService = require('../../app/service/GMessageService.js');


describe('群聊相关的接口', function () {

    it.skip('发送群聊', function (done) {
        gmessageService.send({
            content : 'ree',
            from : '5317228bb538541c1337b16d',
            to : '531729fef556d9381af81230',
            orgId : 1111
        }, done);
    });

    it.skip('接收群聊未读信息',function(done){
        gmessageService.findNewMessage('5316f30fa32deacc1e99ec80',1111,function(err,messages){
            if(err){
                done(err);
            }else{
                console.log(messages);
                messages.should.not.be.empty;
                done();
            }
        });
    });

    it.skip('获取对应群的未读消息',function(done){
        gmessageService.findUnreadMessages('5316f30fa32deacc1e99ec80','531729fef556d9381af81230',1111,function(err,messages){
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





