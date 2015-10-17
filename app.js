var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var strategy = require('./lib/auth-strategy');
var app = express();

var ProjectService = require('./services/project');
var CollectionService = require('./services/collections');

// db
mongoose.connect('mongodb://localhost/campsi');
//mongoose.connect(process.env.MONGOLAB_URI);
//mongoose.set('debug', true);

app.use(session({
    secret: 'campsi_is_great',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


/*
 * Middleware SETUP
 */

app.use(logger('dev', {
    skip: function (req, res) {
        return res.statusCode < 400
    }
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


app.get('/*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,HEAD');
    res.header('Access-Control-Allow-Headers', 'origin, x-requested-with, content-type, accept, authorization, cache-control');
    next();
});


// json web tokens for API
//var authorization = require('./middleware/authorization');
// var jwt = require('express-jwt');
// var jwtCheck = jwt({
// secret: new Buffer('JcxGDNMFtSClr6B_fiQekrHvseS-BLDSIqL16RqV-14ULU1dDYotHQBHi0dTFz6y', 'base64'),
// audience: 'psmD1OCt9ctb8vQOeyXohon3dUVnOQfT'
// });
//app.use(authorization(/^\/components\/.*$/));
//app.use('/api', jwtCheck);

// Routes
app.use('/api/v1', require('./routes/api/v1/get'));
app.use('/api/v1', require('./routes/api/v1/put'));
app.use('/api/v1', require('./routes/api/v1/post'));

app.use('/api/v1/components', require('./routes/api/v1/components'));
app.use('/invitation', require('./routes/invitation'));

app.use('/', require('./routes/index'));

// Auth0 callback handler
app.get(
    '/callback',
    passport.authenticate('auth0', {
        successRedirect: '/#authentification_success',
        failureRedirect: '/#authentification_error'
    }),
    function (req, res) {
        if (!req.user) {
            throw new Error('user null');
        }
        res.redirect("/");
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
