angular.module('vsModule').directive('uploadifyDirective',[function(){
    return {
        scope : {
            config : '=uploadifyDirective'
        },
        link : function($scope,$element,attr){
            setTimeout(function(){
	            if($scope.config.onUploadSuccess){
		            var _onUploadSuccess = $scope.config.onUploadSuccess;
		            $scope.config.onUploadSuccess = function(file, data, response){
			            _onUploadSuccess(file, data, response,attr);
		            }
	            }
	            $element.uploadify($scope.config);
            },100);
        }
    }
}]);