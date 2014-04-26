var mongoose = require('mongoose');
mongoose.connect(global.prop.mongodb.url);
require('./GMessageSchema.js');
require('./SMessageSchema.js');
require('./AttachmentSchema.js');
require('./GroupSchema.js');
require('./UserSchema.js');

if(global.prop.mongoose.debug === true){
	mongoose.set('debug',true);
}
