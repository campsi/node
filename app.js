'use strict';

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
require('./lib/auth-strategy');

var app = express();
var Campsi = require('campsi-core');
var Guest = require('./models/guest');
var Event = require('./models/event');
var config = require('./config');
var i18n = require('i18n');
var request = require('request');


// db
mongoose.connect(config.mongo_uri);

app.use(session({
    secret: config.session_secret,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));
app.use(passport.initialize());
app.use(passport.session());

i18n.configure({
    locales: ['en', 'fr'],
    cookie: 'campsi-app-locale',
    directory: __dirname + '/locales'
});


// view engine setup
app.locals.pretty = true;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

/*
 * Middleware SETUP
 */

// serve static files as is
app.use(express.static(path.join(__dirname, 'public')));

// will parse body to JSON when content-type is passed
app.use(bodyParser.json());

// auth, session, cookies
app.use(cookieParser());

// i18n accept-language negociation is after cookieParser
app.use(i18n.init);

app.use(function (req, res, next) {
    if (req.user && req.user.locale) {
        i18n.setLocale(req, req.user.locale);
    }
    next();
});

app.set('trust proxy', 1); // trust first proxy

Campsi.eventbus.on('*', function (data, event) {
    Event.create({event: event, data: data, date: new Date()});
});

app.get('/api/v1/*', function (req, res, next) {
    req.api = true;
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,HEAD');
    res.header('Access-Control-Allow-Headers', 'origin, x-requested-with, content-type, accept, authorization, cache-control');
    next();
});


// Auth0 callback handler
app.get('/callback', passport.authenticate('auth0'), function (req, res) {
    if (!req.user) {
        throw new Error('user null');
    }

    var redirectTo = req.query.redirectTo || '/dashboard';

    if (req.query.token) {
        Guest.findOne({_id: req.query.token}, function (err, guest) {

            if (guest === null) {
                return res.redirect(redirectTo);
            }

            guest.turnIntoUser(req.user, function () {
                res.redirect(redirectTo);
            })
        });
    } else {
        res.redirect(redirectTo);
    }
});

app.get('/login', function(req, res){
    res.render('login', {
        config: require('./browser-config'),
        redirectTo: req.query.redirectTo
    });
});
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});

require('./lib/components');
require('./lib/campsi-components');


// Routes
app.use('/api/v1', require('./routes/api/v1/acl'));
app.use('/api/v1', require('./routes/api/v1/get'));
app.use('/api/v1', require('./routes/api/v1/put'));
app.use('/api/v1', require('./routes/api/v1/post'));
app.use('/api/v1', require('./routes/api/v1/delete'));
app.use('/api/v1', require('./routes/api/v1/upload'));

app.use('/export', require('./routes/export'));
app.use('/import', require('./routes/import'));

app.use('/api/v1/components', require('./routes/api/v1/components'));
app.use('/invitation', require('./routes/invitation'));
app.use('/stripe', require('./routes/stripe'));

app.use('/ajax-proxy', function (req, res) {
    request({url: req.query.url}, function (error, response, body) {
        if (!error) {
            return res.send(body);
        }
        return res.status(500).json({error: error})
    });
});

app.use('/', require('./routes/index'));

// catch 404 and forward to error handler
app.use(function (req, res) {
    res.status(404);
    res.end();
});

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
    res.status(err.status || 500);

    if (err.status === 404) {
        return res.send('404 / NOT FOUND');
    }
});


module.exports = app;
