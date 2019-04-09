var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var secrets = require('./secrets.js');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// setup db connection
var Db2Store = require('connect-db2')(session);
var sessionStore = new Db2Store({ dsn: secrets.dbURI });
sessionStore.hasDatabaseTable((err, hasTable) => {
  if(err) {
    console.log("Error checking db for table: " + err);
    return;
  }
  if(hasTable === false){
    console.log("Creating session table...");
    sessionStore.createDatabaseTable(err => console.log("Error creating session table: " + err));
  }
})
app.use(session({
  store: sessionStore,
  secret: secrets.sessionSecret
}));

// app.use('/', indexRouter);
app.use('/api/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
