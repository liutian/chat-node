var module = angular.module('vsModule', []);
module.controller('ctrl', function ($scope, $http) {
	$scope.login = function () {
		$http({
			url: '/login',
			method: 'post',
			data: {loginName: $scope.username, pwd: $scope.password}
		}).success(function (data) {
				console.log(data);
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
});
