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
var encryptLib = require('./modules/encryption');
var connection = require('./modules/connection');
var io = require('socket.io')(http);

app.use(session({
   secret: 'secret',
   key: 'user',
   resave: true,
   saveUninitialized: false
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
var catchFinish = null;
var userList = [];

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
  //[2]USER LIST                       [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  socket.on('join userlist', function(username){
    userList.push(username);
  });

  socket.on('get userlist', function(){
    socket.emit('get userlist', userList);
  });

  socket.on('leave userlist', function(username){
    var index = userList.indexOf(username);
    if(index > -1){
      userList.splice(index, 1);
    }
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]DJ QUEUE                        [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  socket.on('dj queue', function(){
      io.emit('dj queue');
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]PLAY SONG                       [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  function sendSong(username){
    var result = [];
    pg.connect(connection, function(err, client, done){
      var grabSong = client.query('SELECT songid FROM songs WHERE username = $1 ORDER BY time LIMIT 1', [username]);
      grabSong.on('row', function(row){
        result.push(row);
      });
      grabSong.on('end', function(){
        io.emit('play song', result[0].songid);
        var timer = [];
        var lastSong = client.query('SELECT time FROM songs WHERE username = $1 ORDER BY time LIMIT 1', [username]);

        lastSong.on('row', function(row){
          timer.push(row);
        });

        lastSong.on('end', function(){
          var updateRecentSong = client.query('UPDATE songs SET time = now() WHERE time = $1 AND username = $2', [timer[0].time, username]);

          updateRecentSong.on('end', function(){
            client.end();
          });
        });
      });
    });
  }

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]JOIN DJ QUEUE                   [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  socket.on('join dj', function(username){
    var results = [];
    pg.connect(connection, function(err, client, done){
      var joinDJ = client.query('INSERT INTO djqueue (username, time) VALUES ($1, now())', [username], function(err, result){
        if(err){
          console.log('joindj err', err);
        }else{
          console.log('joined');
          var getQueue = client.query('SELECT * FROM djqueue');

          getQueue.on('row', function(row){
            results.push(row);
          });

          getQueue.on('end', function(){
            console.log(results.length);
            io.emit('dj queue');
            if(results.length == 1){
              sendSong(username);
              io.emit('current dj', username);
            }
          });
          if(err){
            console.log('djqueue ', err);
          }
        }
      });
    });
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]LEAVE DJ QUEUE                  [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  socket.on('leave dj', function(username){
    pg.connect(connection, function(err, client, done){
      var isDJ = [];
      var findDJ = client.query('SELECT * FROM djqueue WHERE username = $1', [username]);
      findDJ.on('row', function(row){
        isDJ.push(row);
      });
      findDJ.on('end', function(){
        if(isDJ.length > 0){
          var removeDJ = client.query('DELETE FROM djqueue WHERE username = $1', [username], function(err, result){
            if(err){
              console.log('error', err);
            }else{
              console.log('deleted');
              client.end();
            }
          });
        }else{
          //may need to create a possible fall back
        }
      });
    });
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]SONG FINISHED                   [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  function changeSong(){
    pg.connect(connection, function(err, client, done){
      var lastDJ = [];
      var findLastDJ = client.query('SELECT * FROM djqueue ORDER BY time LIMIT 1');

      findLastDJ.on('row', function(row){
        lastDJ.push(row);
      });

      findLastDJ.on('end', function(){
        try{
          var updateLastDJ = client.query('UPDATE djqueue SET time = now() WHERE username = $1', [lastDJ[0].username]);

          updateLastDJ.on('end', function(){
            var newDJ = [];
            var grabNewDJ = client.query('SELECT * FROM djqueue ORDER BY time LIMIT 1');

            grabNewDJ.on('row', function(row){
              newDJ.push(row);
            });

            grabNewDJ.on('end', function(){
              sendSong(newDJ[0].username);
              io.emit('current dj', newDJ[0].username);
              catchFinish = null;
              client.end();
            });
          });
        }
        catch(error){
          console.log('change song err:', error);
          return false;
        }

        if(err){
          console.log('SQL change song err', err);
        }
      });
    });
  }

  socket.on('song finished', function(username){
    if(catchFinish == null){
      catchFinish = setTimeout(changeSong, 7000);
    }
  });

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
