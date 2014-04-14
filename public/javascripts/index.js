var module = angular.module('vsModule', []);
module.controller('ctrl', function ($scope, $http) {
	var socket = null;

	$scope.login = function () {
		$http({
			url: '/login',
			method: 'post',
			data: {loginName: $scope.username, pwd: $scope.password}
		}).success(function (data) {
			if(data.code == 10000){
				console.log('login success');
				initSocket();
			}
		}).error(function () {
			console.log('login error');
		});
	}

	$scope.getData = function () {
		$http({
			url: '/api/user',
			method: 'get'
		}).success(function (data) {
			console.log(data);
		}).error(function (data) {
			alert('error');
		});
	}

	$scope.uploadConfig = {
		swf: '/javascripts/uploadify/uploadify.swf',
		fileObjName: 'fileUpload',
		uploader: '/api/upload',
		multi: false,
		fileTypeDesc: '请选择图片文件',
		fileTypeExts: '*.jpg;*.png;*.jpeg;*.bmp;*.gif;',
		fileSizeLimit: '5MB',
		buttonClass: 'btn btn-default',
		width: 80,
		height: 34,
		buttonText: '附加图片',
		onUploadSuccess: function (file, data, response, attr) {
			data = JSON.parse(data);
			console.log(data);
		}
	}

	function initSocket(){
		socket = io.connect('http://localhost:3000');

		socket.on('whisper',function(data){
			alert('whisper:' + data.content);
		});

		socket.on('broadcast',function(data){
			alert('broadcast data:' + data);
		})
	}

	$scope.whisper = function(){
		if(socket){
			socket.emit('whisper',{toUserId : $scope.toUserId,content : '你好'});
		}
	}

	$scope.broadcast = function(){
		if(socket){
			socket.emit('broadcast',{content : '你好'});
		}
	}
});
