require('native-promise-only');
module.exports = require('../plugins/html')(require('../plugins/router')(require('./weddell')));
