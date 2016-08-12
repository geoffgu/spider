'use strict';

const Express = require('express');
const Path = require('path');
const Favicon = require('serve-favicon');
const Logger = require('morgan');
const CookieParser = require('cookie-parser');
const BodyParser = require('body-parser');
const Mongoose = require('mongoose');

const Index = require('./routes/index');
const Users = require('./routes/users');
const DbConfig = require('./db/config');

const App = Express();

// view engine setup
App.set('views', Path.join(__dirname, 'views'));
App.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//App.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
App.use(Logger('dev'));
App.use(BodyParser.json());
App.use(BodyParser.urlencoded({ extended: false }));
App.use(CookieParser());
App.use(Express.static(Path.join(__dirname, 'public')));

App.use('/', Index);
App.use('/users', Users);

App.listen(8200, function () {
  console.log("Server Start!");
});

// catch 404 and forward to error handler
App.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (App.get('env') === 'development') {
  App.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
App.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

Mongoose.connect(DbConfig.dbLogin);

const db = Mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
  // we're connected!
  console.log('mongodb server start!');
});

module.exports = App;
