var passport = require('passport');
var User=  require('../../models/user');
var Auth0Strategy = require('passport-auth0');

var strategy = new Auth0Strategy(require('../../config').auth0, function(accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user

    User.findOrCreate(profile, function(err, user){
        done(null, user);
    });
});

passport.use(strategy);

// This is not a best practice, but we want to keep things simple for now
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

module.exports = strategy;