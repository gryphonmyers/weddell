require('native-promise-only');
module.exports = require('../plugins/action-dispatcher')(
    require('../plugins/css-vars')(
        require('../plugins/html-to-vdom')(
            require('../plugins/doT')(
                require('../plugins/fetcher')(
                    require('../plugins/vdom')(
                        require('../plugins/router')(require('./weddell'))
                    )
                )
            )
        )
    )
);
