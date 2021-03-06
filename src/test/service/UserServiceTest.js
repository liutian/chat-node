require('../../app/schema/UserSchema.js');
require('should');
var mongoose = require('mongoose')
    , userService = require('../../app/service/UserService.js');


describe('用户相关的接口', function () {

    it.skip('注册用户', function (done) {
        userService.signUp({
            loginName: 'fyn',
            nickName : '冯娜娜',
            orgId : 1,
            pwd: '123456',
	        refId : 22
        }, done);
    });

    it.skip('用户登录验证', function (done) {
        userService.signIn({
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

    it.skip('获取全部用户列表',function(done){
        userService.findAllUsers(null,function(err,users){
            if(err != null){
                done(err);
            }else{
                users.should.not.be.empty;
                done();
            }
        });
    });
})





