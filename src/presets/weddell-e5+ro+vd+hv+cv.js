require('native-promise-only');
module.exports = require('../plugins/css-vars')(
    require('../plugins/html-to-vdom')(
        require('../plugins/vdom')(
            require('../plugins/router')(require('./weddell'))
        )
    )
);
