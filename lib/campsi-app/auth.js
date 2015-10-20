var lock = new Auth0Lock(window.AUTH0.clientID, window.AUTH0.domain);

module.exports = function() {
    lock.show({
        callbackURL: window.HOST + window.AUTH0.callbackURL
        , responseType: 'code'
        , authParams: {
            scope: 'openid profile'
        }
    });
};
