var conf = window.CONF.auth0;
var lock = new Auth0Lock(conf.clientID, conf.domain);
var options = {
    callbackURL: window.CONF.host + conf.callbackURL
    , responseType: 'code'
    , authParams: {
        scope: 'openid profile'
    }
};
module.exports = function (mode) {
    if (mode === 'signup') {
        lock.showSignup(options);
    } else {
        lock.showSignin(options);
    }
};
