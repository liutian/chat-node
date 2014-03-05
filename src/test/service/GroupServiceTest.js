require('../../app/schema/GroupSchema.js');
require('../../app/schema/UserSchema.js');
require('should');
var mongoose = require('mongoose')
    , groupService = require('../../app/service/GroupService.js');


describe('群相关的接口', function () {

    it.skip('创建群', function (done) {
        groupService.create({
            name : '全面战争',
            founder : '5316f3384951a8381ac91a40',
            orgId : 1111
        }, done);
    });

    it.skip('解散群', function(done){
        groupService.disband('5316f3384951a8381ac91a40','5316fd89f008d5841d5b0f8d',done);
    });

    it.skip('加入群',function(done){
        groupService.join('5316f30fa32deacc1e99ec80','5316fd37e2ec20dc19bc1172',done);
    });

    it.skip('退出群',function(done){
        groupService.exit('5316f36f2188eaa40acf7cf8','5316fd37e2ec20dc19bc1172',done);
    });

    it.skip('群重命名',function(done){
        groupService.rename('5316f2e7d01fc1d8187fb44c','5316fd37e2ec20dc19bc1172','你是谁',done);
    });

})





