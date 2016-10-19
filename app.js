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

// todo move ;-)
var Collection = require('./models/collection');
var Entry = require('./models/entry');
var util = require('util');

var getPropertyValue = function (obj, path) {
    if (typeof path !== 'string') {
        return;
    }
    var parts = path.split('/');
    var ref = obj;
    parts.forEach(function (part) {
        ref = ref && ref[part] ? ref[part] : undefined;
    });
    return ref;
};

var setPropertyValue = function (obj, path, value) {
    if (typeof path !== 'string') {
        return;
    }
    var parts = path.split('/');
    var lastPart = parts.pop();
    var ref = obj;

    parts.forEach(function (part) {
        ref = ref && ref[part] ? ref[part] : undefined;
    });

    ref[lastPart] = value;
};

var cleanParams = function (params) {
    var cleaned = {};
    for (var p in params) {
        if (params.hasOwnProperty(p)) {
            if (typeof params[p] !== 'undefined') {
                cleaned[p] = params[p];
            }
        }
    }

    return cleaned;
};

Campsi.eventbus.on('entry:create', function (data) {

    Collection.findOne({_id: data.collection._id}, function (err, collection) {
        var facebookFields = collection.getFieldsByType('campsi/publish/facebook');
        if (facebookFields.length > 0) {
            Entry.findOne({_id: data.entry}, function (err, entry) {
                facebookFields.forEach(function (facebookField) {
                    var facebookEntryValue = getPropertyValue(entry.data, facebookField.path);
                    if (facebookField.feed.id
                        && facebookField.feed.access_token
                        && (facebookEntryValue.post === 'now' || facebookEntryValue.post === 'later')
                    ) {
                        var url = 'https://graph.facebook.com/v2.6/' + facebookField.feed.id + '/feed?access_token=' + facebookField.feed.access_token;

                        var params = {};

                        params.message = facebookEntryValue.message;
                        params.picture = getPropertyValue(entry.data, facebookField.linkFields.image);

                        if (params.picture) {
                            params.picture = params.picture.src;
                        }

                        params.link = getPropertyValue(entry.data, facebookField.linkFields.url);
                        params.description = getPropertyValue(entry.data, facebookField.linkFields.description);
                        params.name = getPropertyValue(entry.data, facebookField.linkFields.name);

                        //todo schedule
                        //params.scheduled_publish_time = '';

                        request.post({
                            url: url,
                            formData: cleanParams(params)
                        }, function optionalCallback(err, httpResponse, body) {
                            var post = JSON.parse(body);
                            if (post.id) {
                                setPropertyValue(entry.data, facebookField.path + '/post_id', post.id);
                                setPropertyValue(entry.data, facebookField.path + '/status', 'published');
                                entry.markModified('data');
                                entry.save(function (err) {
                                    if (err) {
                                        console.error(err);
                                    } else {
                                        console.info('Saved Facebook post ID', post);
                                    }
                                });
                            }
                        });
                    }
                });
            });
        }
    });
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

    var redirectTo = req.query.redirectTo || '/projects';

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

app.get('/login', function (req, res) {
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

app.use('/api/v1/components', require('./routes/api/v1/components'));
app.use('/invitation', require('./routes/invitation'));
app.use('/utils', require('./routes/utils'));
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
