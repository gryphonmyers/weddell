module.exports = require('../plugins/doT')(
    require('../plugins/html')(
        require('../plugins/router')(
            require('./weddell')
        )
    )
);
