var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var authorization = require('./middleware/authorization');

var app = express();
/*
var jwt = require('express-jwt');
var jwtCheck = jwt({
    secret: new Buffer('JcxGDNMFtSClr6B_fiQekrHvseS-BLDSIqL16RqV-14ULU1dDYotHQBHi0dTFz6y', 'base64'),
    audience: 'psmD1OCt9ctb8vQOeyXohon3dUVnOQfT'
});
*/
mongoose.connect('mongodb://localhost/campsi');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev',{
    skip: function (req, res) { return res.statusCode < 400 }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
//app.use(authorization(/^\/components\/.*$/));
app.use(express.static(path.join(__dirname, 'public')));
//app.use('/api', jwtCheck);

app.use('/api/v1/collections', require('./routes/api/v1/collections'));
app.use('/api/v1/projects', require('./routes/api/v1/projects'));
app.use('/api/v1/users', require('./routes/api/v1/users'));
app.use('/', require('./routes/index'));
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
