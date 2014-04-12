var fs = require('fs'),
	_ = require('underscore');

var prop = require('./prop.json');
if(fs.existsSync('./prop_test.json')){
	_.extend(prop,require('./prop_test.json'));
}

if(fs.existsSync('./prop_dev.json')){
	_.extend(prop,require('./prop_dev.json'));
}

global.prop = prop;
