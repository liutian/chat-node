require('../../app/schema/UserSchema.js');
require('should');
var mongoose = require('mongoose')
    , userService = require('../../app/service/UserService.js');


describe('用户相关的接口', function () {

    it.skip('注册用户', function (done) {
        userService.signIn({
            loginName: 'liuss@visionet.com.cn',
            nickName : '微企员工',
            profilePhoto: 'wqyg.jpg',
            orgId : 2222,
            pwd: '123456'
        }, done);
    });

    it.skip('用户登录验证', function (done) {
        userService.loginInValid({
            loginName : '1191577401@qq.com',
            pwd : '123456'
        }, function (err) {
            err != null && err.should.eql(null);
            done();
        });
    });

    it.skip('编辑用户',function(done){
        userService.editUser({
                loginName : '1191577401@qq.com',
                nickName : '雪山白狐',
                sex : 'w',
                profilePhoto : 'xsbh.jpg'
            },done);
    });
})




