var log4js = require('log4js');
module.exports = function (config) {
	var appenders = [
		{
			type: 'dateFile',
			pattern : '-yyyy-MM-dd',
			filename: 'log_file.log',
			alwaysIncludePattern : true
		}
	];
	var configure = {appenders : appenders};

	if(config.console === true){
		appenders.push({type: 'console'});
		configure.replaceConsole = true;
	}

	log4js.configure(configure,{cwd : config.dir});

	log4js.setGlobalLogLevel(config.level);
}
