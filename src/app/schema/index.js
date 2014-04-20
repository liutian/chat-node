var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chat');
require('./GMessageSchema.js');
require('./SMessageSchema.js');
require('./AttachmentSchema.js');
require('./GroupSchema.js');
require('./UserSchema.js');
mongoose.set('debug',true);
