require('native-promise-only');
module.exports = require('../plugins/vdom')(require('../plugins/router')(require('./weddell')));
