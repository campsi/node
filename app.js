var express = require('express');
var path = require('path');
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
var winston = require('winston');
var config = require('./config');
var expressWinston = require('express-winston');
var Campsi = require('campsi');


//i18n
var i18n = require('i18n');

i18n.configure({
    locales: ['en', 'fr'],
    cookie: 'campsi-app-locale',
    directory: __dirname + '/locales'
});

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

// view engine setup
app.locals.pretty = true;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

/*
 * Middleware SETUP
 */


require('winston-loggly');


app.use(expressWinston.logger({
    transports: [
        new winston.transports.Loggly({
            token: config.loggly.token,
            subdomain: "campsi",
            tags: ["Winston-NodeJS"],
            json: true
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

// i18n accept-language negociation is after cookieParser
app.use(i18n.init);

app.set('trust proxy', 1); // trust first proxy


app.get('/api/v1/*', function (req, res, next) {
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

    if (req.query.token) {
        Guest.findOne({_id: req.query.token}, function (err, guest) {

            if (guest === null) {
                return res.redirect('/');
            }

            guest.turnIntoUser(req.user, function () {
                res.redirect('/projects');
            })
        });
    } else {
        console.info("should redirect");
        res.redirect('/projects');
    }
});

app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});

//require('./middleware/deployments');

// Routes
app.use('/api/v1', require('./routes/api/v1/get'));
app.use('/api/v1', require('./routes/api/v1/put'));
app.use('/api/v1', require('./routes/api/v1/post'));
app.use('/api/v1', require('./routes/api/v1/delete'));
app.use('/api/v1', require('./routes/api/v1/upload'));

app.use('/export', require('./routes/export'));
app.use('/import', require('./routes/import'));

app.use('/api/v1/components', require('./routes/api/v1/components'));
app.use('/invitation', require('./routes/invitation'));
app.use('/profile', require('./routes/profile'));

app.use('/', require('./routes/index'));

app.get('/undefined', function (req, res) {
    res.send('U MAD BRO');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);

    if (err.status === 404) {
        return res.send('404 / NOT FOUND');
    }

    winston.log('error', {
        req: {
            method: req.method,
            headers: req.headers
        },
        err: {
            message: err.message,
            stack: err.stack
        }
    });
    res.json({
        message: err.message,
        error: err.stack.split('\n')
    });
});


module.exports = app;
