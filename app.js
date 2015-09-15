var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var authorization = require('./middleware/authorization');
var routes = require('./routes/index');

var app = express();

var jwt = require('express-jwt');

var jwtCheck = jwt({
    secret: new Buffer('JcxGDNMFtSClr6B_fiQekrHvseS-BLDSIqL16RqV-14ULU1dDYotHQBHi0dTFz6y', 'base64'),
    audience: 'psmD1OCt9ctb8vQOeyXohon3dUVnOQfT'
});

mongoose.connect('mongodb://localhost/campsi');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//app.use(require('stylus').middleware(path.join(__dirname, 'public')));

//var stylus = require('stylus');
//app.use(
//    stylus.middleware({
//        src:  __dirname + "/assets/stylus",
//        dest: __dirname + "/assets/css",
//        debug: true,
//        compile : function(str, path) {
//            console.log('compiling');
//            return stylus(str)
//                .set('filename', path)
//                .set('warn', true)
//                .set('compress', true);
//        }
//    })
//);


app.use(authorization(/^\/components\/.*$/));
app.use(express.static(path.join(__dirname, 'public')));
//app.use('/api', jwtCheck);
app.use('/', routes);
app.use('/api/v1/collections', require('./routes/api/v1/collections'));
app.use('/api/v1/projects', require('./routes/api/v1/projects'));
app.use('/api/v1/users', require('./routes/api/v1/users'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
