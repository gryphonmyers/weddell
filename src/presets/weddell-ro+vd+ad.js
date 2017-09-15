module.exports = require('../plugins/vdom')(
    require('../plugins/action-dispatcher')(require('../plugins/router')(require('./weddell')))
);
