var conf = window.CONF.auth0;
var lock = new Auth0Lock(conf.clientID, conf.domain);

module.exports = function() {
    lock.show({
        callbackURL: window.CONF.host + conf.callbackURL
        , responseType: 'code'
        , mode: 'signup'
        , authParams: {
            scope: 'openid profile'
        }
    });
};
