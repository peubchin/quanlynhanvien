var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/usersRoute');
const fileUpload = require('express-fileupload');
const { ObjectId } = require('mongodb-legacy');
const jwt = require('jsonwebtoken');

let MongoClient = require('mongodb-legacy').MongoClient;
let client = new MongoClient('mongodb://127.0.0.1:27017');
let csdl = client.db('quanlynhanvien');

var app = express();
app.use(fileUpload());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set up session middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Set up flash middleware
app.use(flash());

app.use(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const id = decoded.userId;

    if (!ObjectId.isValid(id)) {
      console.log('Invalid user ID');
      return next();
    }
    const user = await csdl.collection('nhanvien').findOne({ _id: new ObjectId(id) });
    if (!user) {
      return next();
    }
    res.locals.user = user;
    next();
  } catch (e) {
    console.error(e);
    return next();
  }
});

// Make flash messages available in all views
app.use((req, res, next) => {
  res.locals.messages = req.flash(); // Chỉnh lại để tránh lỗi undefined
  next();
});

app.use('/', indexRouter);
app.use('/login', usersRouter);

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

app.use('/logout', indexRouter);
app.use('/find', indexRouter);

module.exports = app;
