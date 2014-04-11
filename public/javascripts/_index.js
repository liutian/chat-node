var module = angular.module('vsModule',[]);
module.controller('ctrl',function($scope,$http){
	$scope.login = function(){
		$http({
			url : 'http://192.168.1.102:3000/login',
			method : 'post',
			data : {username : $scope.username,password : $scope.password},
			withCredentials : true
		}).success(function(data){
			console.log('login success');
		}).error(function(){
			console.log('login error');
		});
	}

	$scope.uploadConfig = {
		swf: '/demo1/js/uploadify/uploadify.swf',
		fileObjName: 'fileUpload',
		uploader: 'http://192.168.1.102:3000/api/upload;sid=s%3AzVwCAv9rxjp1TCygzQvPb0J4.68aIOqovEMaMsMvcrmJy6%2BlNx%2BSnW5SEi4wDoN8oByc',
		multi: false,
		fileTypeDesc : '请选择图片文件',
		fileTypeExts : '*.jpg;*.png;*.jpeg;*.bmp;*.gif;*.js',
		fileSizeLimit : '5MB',
		buttonClass: 'btn btn-default',
		width: 80,
		height: 34,
		buttonText: 'add photo',
		onUploadSuccess: function (file, data, response,attr) {
			data = JSON.parse(data);
		}
	}
});
