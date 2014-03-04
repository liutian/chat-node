require('../../app/schema/UserSchema.js');
require('should');
var mongoose = require('mongoose')
    , userService = require('../../app/service/UserService.js');


describe('用户相关的接口', function () {

    it.skip('注册用户', function (done) {
        userService.signIn({
            loginName: 'ds11',
            nickName : '你妹的',
            profilePhoto: 'tt.jpg',
            orgId : 1111,
            pwd: '123456'
        }, done);
    });

    it.skip('用户登录验证', function (done) {
        userService.loginInValid({
            orgId : 1111,
            loginName : 'ds',
            pwd : '123456'
        }, function (err,result) {
            result.should.be.true;
            done();
        });
    });

    it.skip('编辑用户',function(done){
        userService.editUser({
                orgId : 1111,
                loginName : 'ds',
                nickName : '我的是'
            },done);
    });
})





