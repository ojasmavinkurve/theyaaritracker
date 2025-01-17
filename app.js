var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressSession = require('express-session');
const flash=require("connect-flash");
//var mongoose = require('mongoose');
var mongoose = require('./dbsetup');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const passport = require('passport');
var app = express();

//const __dirname=path.resolve();

// MongoDB connection
// const mongoURI = 'mongodb+srv://ojamavinkurve:q8E0qOoKpNkI8V2m@cluster0.y924tv6.mongodb.net/theyaaritracker?retryWrites=true&w=majority&appName=Cluster0';
// mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log(err));

//setting ejs
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());
app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret:"randomly"
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
//app.use('/api/user', userRouter); // Use user route

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
