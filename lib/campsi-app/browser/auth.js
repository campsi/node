'use strict';
var conf = window.CONF.auth0;
var lock = new Auth0Lock(conf.clientID, conf.domain);
var qs = require('querystringify');

var options = {
    callbackURL: window.CONF.host + conf.callbackURL,
    responseType: 'code',
    authParams: {
        scope: 'openid profile',
        display: 'popup'
    }
};
module.exports = function (mode, params, opts) {
    if (params) {
        options.callbackURL += qs.stringify(params, true);
    }

    if (typeof opts !== 'undefined') {
        var prop;
        for (prop in opts) {
            if (opts.hasOwnProperty(prop)) {
                options[prop] = opts[prop];
            }
        }
    }

    if (mode === 'signup') {
        lock.showSignup(options);
    } else if (mode === 'login') {
        lock.showSignin(options);
    } else {
        lock.show(options);
    }
};