var _ = require('underscore');
var util = require('util');
function BaseError(code, msg) {
    var args = [].slice.apply(arguments);
    if (_.isString(code)) {
        msg = code;
        code = BaseError.ERROR;
    }else{
        args.shift();
    }
    msg = util.format.apply(null, args);

    this.code = code;
    this.message = msg;
    Error.captureStackTrace(this);
}
BaseError.OK = 10000;
BaseError.ERROR = 10001;
// 长度限制
BaseError.LENGTH_LIMIT = 10002;
// 个数限制
BaseError.SIZE_LIMIT = 10003;
// 违规操作
BaseError.ILLEGAL = 10004;
// 禁止访问
BaseError.ACCESSDENIED = 10005;
// 资源不存在
BaseError.NOTFIND = 10006;
// 非空限制
BaseError.REQUIRE = 10007;
//名称重复
BaseError.NAMEREPEAT = 10008;
//参数错误
BaseError.PARAMETERERROR = 10009;

BaseError.prototype = Error.prototype;

BaseError.prototype.name = 'BaseError';

module.exports = BaseError;