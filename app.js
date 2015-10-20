var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var strategy = require('./lib/auth-strategy');
var app = express();
var async = require('async');
var Guest = require('./models/guest');
var Project = require('./models/project');
var config = require('./config');

// db
mongoose.connect(config.mongo_uri);

app.use(session({
    secret: 'campsi_is_great',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

/*
 * Middleware SETUP
 */

var winston = require('winston');

require('winston-loggly');

var expressWinston = require('express-winston');

app.use(expressWinston.logger({
    transports: [
        new winston.transports.Loggly({
            token: config.loggly.token,
            subdomain: "campsi",
            tags: ["Winston-NodeJS"],
            json:true
        })
    ]
}));

// serve static files as is
app.use(express.static(path.join(__dirname, 'public')));

// serve favicon too
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// will parse body to JSON when content-type is passed
app.use(bodyParser.json());

// don't know why it's here
app.use(bodyParser.urlencoded({extended: false}));

// auth, session, cookies
app.use(cookieParser());
app.set('trust proxy', 1); // trust first proxy


app.get('/api/v1/*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,HEAD');
    res.header('Access-Control-Allow-Headers', 'origin, x-requested-with, content-type, accept, authorization, cache-control');
    next();
});

// Routes
app.use('/api/v1', require('./routes/api/v1/get'));
app.use('/api/v1', require('./routes/api/v1/put'));
app.use('/api/v1', require('./routes/api/v1/post'));
app.use('/api/v1', require('./routes/api/v1/upload'));

app.use('/api/v1/components', require('./routes/api/v1/components'));
app.use('/invitation', require('./routes/invitation'));
app.use('/profile', require('./routes/profile'));

app.use('/', require('./routes/index'));

// Auth0 callback handler
app.get('/callback', passport.authenticate('auth0'), function (req, res) {
    if (!req.user) {
        throw new Error('user null');
    }

    if (req.query.token) {

        Guest.findOne({_id: req.query.token}, function (err, guest) {

            if (guest === null) {
                res.redirect('/');
            }

            async.forEach(guest.invitations, function (invitation, cb) {

                Project.findOne({_id: invitation._project}, function (err, project) {

                    if (invitation.roles.indexOf('admin') !== -1) {
                        project.addUser('admins', req.user._id);
                    }

                    if (invitation.roles.indexOf('designer') !== -1) {
                        project.addUser('designers', req.user._id);
                    }

                    project.save(function () {
                        cb();
                    });

                });
            }, function () {
                res.redirect('/');
            });
        });
    } else {
        res.redirect('/');
    }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
