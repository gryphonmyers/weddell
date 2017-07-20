require('native-promise-only');
module.exports = require('../plugins/doT')(
    require('../plugins/router')(
        require('./weddell')
    )
);
