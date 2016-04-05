var express = require('express');
var path = require('path');
var session = require('express-session');
var pg = require('pg');
var bodyParser = require('body-parser');
var passport = require('./modules/user');
var index = require('./routes/index');
var app = express();
var router = express.Router();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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

//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
//[1]WEBSOCKET LOGIC                           [1]//
//[x]||||||||||||||||||||||||||||||||||||||||||[x]//

//[x]||||||||||||||||||||||||||||||||[x]//
//[2]WEBSOCKET GLOBAL VARS           [2]//
//[x]||||||||||||||||||||||||||||||||[x]//
var usersConnected = 0;

//[x]||||||||||||||||||||||||||||||||[x]//
//[2]SOCKET CONNECTION               [2]//
//[x]||||||||||||||||||||||||||||||||[x]//
io.on('connection', function(socket){
  usersConnected++;
  console.log('users connected >>', usersConnected);

  socket.on('disconnect', function(){
    usersConnected--;
    console.log('users connected >>', usersConnected);
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]DJ QUEUE                        [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  socket.on('dj queue', function(){
      io.emit('dj queue');
  });

  // socket.on('play song', function(song){
  //   io.emit('play song', song);
  // });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]CHAT LOGIC                      [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//

  var alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
  function colorPicker(id){
    if(isNaN(id.userId.slice(-1)) == false){
      return 'steelblue';
    }else{
      number = alphabet.indexOf(id.userId.slice(-1))+1;
    }
    if(number <= 5){
      return 'red';
    }
    if(number > 5 && number <= 10){
      return 'blue';
    }
    if(number > 10 && number <= 15){
      return 'purple';
    }
    if(number > 15 && number <= 20){
      return 'yellowgreen';
    }
    if(number > 20 && number <= 25){
      return 'lime';
    }
    else {
      return 'tomato';
    }
  }

  var messageDB = [];
  socket.on('user chat message', function(idandmsg){
    var msg = {userId: idandmsg.userId, msg: idandmsg.msg, color: colorPicker(idandmsg)}

    if(messageDB.length == 100){
      messageDB = [];
      messageDB.unshift(msg);
      io.emit('user chat message', messageDB[0]);
    }else{
      messageDB.unshift(msg);
      io.emit('user chat message', messageDB[0]);
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
