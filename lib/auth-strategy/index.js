var passport = require('passport');
var User=  require('../../models/user');
var Auth0Strategy = require('passport-auth0');
var userHash = {};

var strategy = new Auth0Strategy(require('../../config').auth0, function(accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user

    User.findOrCreate(profile, function(err, user){
        userHash[user._id] = user;
        done(null, user);
    });
});

passport.use(strategy);

passport.serializeUser(function(user, done) {
    done(null, user._id.toString());
});


passport.deserializeUser(function(userId, done) {
    if(typeof userHash[userId] !== 'undefined'){
        return done(null, userHash[userId]);
    }
    User.findOne({_id: userId}, function(err, user){
        userHash[user._id] = user;
        done(err, user);
    })
});

module.exports = strategy;