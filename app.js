var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// watson stuff
let assistant_id = process.env.ASSISTANT_ID;
let assistant_api_key = process.env.ASSISTANT_IAM_APIKEY;
let assistant_url = process.env.ASSISTANT_URL;
var AssistantV2 = require('ibm-watson/assistant/v2'); // watson sdk
var IamAuthenticator = require('ibm-watson/auth').IamAuthenticator;

// Create the service wrapper
var assistant = new AssistantV2({
  version: '2019-02-28',
  authenticator: new IamAuthenticator({
    apikey: assistant_api_key
  }),
  url: assistant_url,
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res, next) {
  // get a session
  assistant.createSession({
    assistantId: assistant_id
  }).
  then(res => {
    let session_id = res.result.session_id;

    assistant.message({
      assistantId: assistant_id,
      sessionId: session_id,
      input: {
        'message_type': 'text',
        'text': ''
        }
      })
      .then(res => {
        console.log(JSON.stringify(res.result, null, 2));
      })
      .catch(err => {
        console.log(err);
      });
  })
  .catch(err => {
    console.log(err);
  });

  res.render('index', { title: 'Express' });
});

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
