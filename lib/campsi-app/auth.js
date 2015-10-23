//var Auth0Lock = require('auth0-lock');
var conf = CONF.auth0;
var lock = new Auth0Lock(conf.clientID, conf.domain);

module.exports = function() {
    lock.show({
        callbackURL: window.CONF.host + conf.callbackURL
        , responseType: 'code'
        , authParams: {
            scope: 'openid profile'
        }
    });
};
