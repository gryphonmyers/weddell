require('native-promise-only');
module.exports = require('../plugins/action-dispatcher')(
    require('./weddell')
);
