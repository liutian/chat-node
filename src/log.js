var log4js = require('log4js');
module.exports = function (config) {
	log4js.configure({
		appenders: [
			{
				type: 'console'
			},
			{
				type: 'dateFile',
				pattern : '-yyyy-MM-dd',
				filename: 'log_file.log',
				alwaysIncludePattern : true
			}
		],
		replaceConsole: true
	},{cwd : config.dir});

	log4js.setGlobalLogLevel(config.level);
}
