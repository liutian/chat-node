require('../../app/schema/GroupSchema.js');
require('../../app/schema/UserSchema.js');
require('should');
var mongoose = require('mongoose')
    , groupService = require('../../app/service/GroupService.js');


describe('群相关的接口', function () {

    it.skip('创建群', function (done) {
        groupService.create({
            name : '微企客服555',
            founder : '5317226274dffeb41c9ba303',
            orgId : 1111
        }, done);
    });

    it.skip('解散群', function(done){
        groupService.disband('5316f3384951a8381ac91a40','5316fd89f008d5841d5b0f8d',done);
    });

    it.skip('加入群',function(done){
        groupService.join('534b913a58d966a81afdfeb2','53172a2efb759cc41577d93e',done);
    });

    it.skip('退出群',function(done){
        groupService.exit('5316f36f2188eaa40acf7cf8','5316fd37e2ec20dc19bc1172',done);
    });

    it.skip('群重命名',function(done){
        groupService.rename('5316f2e7d01fc1d8187fb44c','5316fd37e2ec20dc19bc1172','你是谁',done);
    });

    it.skip('查询关于用户的所以群',function(done){
        groupService.findGroupsAboutUser('5316f3384951a8381ac91a40',function(err,groups){
            if(err){
                done(err);
            }else{
                console.log(groups);
                groups.should.not.be.empty;
                done();
            }
        });
    });
})





