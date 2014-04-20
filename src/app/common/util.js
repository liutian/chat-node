exports.createSessionId = function(str1,str2){
	var strArr = [str1,str2];
	return strArr.sort().join();
}