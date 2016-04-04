var express = require('express');
var path = require('path');
var session = require('express-session');
var pg = require('pg');
var bodyParser = require('body-parser');
var passport = require('./modules/user');
var index = require('./routes/index');
var app = express();

//SETUP EXPRESS SESSION
app.use(session({
   secret: 'secret',
   key: 'user',
   resave: true,
   saveUninitialized: false,
   cookie: { maxAge: 60000, secure: false }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use('/', index);

var server = app.listen(3000, function(){
  var port = server.address().port;
  console.log('Listening on port: ', port);
});
