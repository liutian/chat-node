require('../../app/schema/GroupSchema.js');
require('should');
var mongoose = require('mongoose')
    , groupService = require('../../app/service/GroupService.js');


describe('群相关的接口', function () {

    it.skip('创建群', function (done) {
        groupService.create({
            name : '我的MT',
            founder : '5315a4c4d031dc541abf0eba',
            orgId : 111
        }, done);
    });

    it.skip('解散群', function(done){
        groupService.disband('5315a4c4d031dc541abf0eba','5315e57bdd889abc1ec9e024',done);
    });

    it.skip('加入群',function(done){
        groupService.join('1315a4ebe31bcc641ebdb252','5315ee8c3482f6301faa46aa',done);
    });

    it.skip('退出群',function(done){
        groupService.exit('5315a4ebe31bcc641ebdb252','5315ee8c3482f6301faa46aa',done);
    });

    it.skip('群重命名',function(done){
        groupService.rename('5315a4c4d031dc541abf0eba','5315ee8c3482f6301faa46aa','你是谁',done);
    });

})





