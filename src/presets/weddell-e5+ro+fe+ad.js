require('native-promise-only');
module.exports = require('../plugins/action-dispatcher')(
    require('../plugins/fetcher')(
        require('../plugins/router')(
            require('./weddell')
        )
    )
);
