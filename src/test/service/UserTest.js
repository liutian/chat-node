/**
 * Created with JetBrains WebStorm.
 * User: liuss
 * Date: 13-8-25
 * Time: 下午4:45
 * To change this template use File | Settings | File Templates.
 */
require('../../app/schema/User.js');
require('should');
var mongoose = require('mongoose')
    , userService = require('../../app/service/User.js');


describe('用户相关的接口', function () {

    it('注册用户', function (done) {
        userService.registerUser({
            nickName: '模糊的月亮',
            profilePhoto: 'tt.jpg',
            pwd: '123456'
        }, done);
    });

    it.only('用户登录', function (done) {
        userService.loginValidUser({
            id: '5314326aa189cb5807000004',
            token: '62347510-a2a7-11e3-a4c7-bb50f34c5b5c',
            secretKey: 'e10adc3949ba59abbe56e057f20f883e'
        }, function (result) {
            result.should.be.true;
            done();
        });
    });

    it.only('编辑用户',function(done){
        userService.editUser({id : '5314326aa189cb5807000004'},done);
    });
})





