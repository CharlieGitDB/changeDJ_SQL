var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var encryptLib = require('../modules/encryption');
var connection = require('../modules/connection');
var passport = require('passport');
var pg = require('pg');
var router = express.Router();

router.use('/', express.static(path.join(__dirname, '../public')));
router.get('/', function(request,response){
  response.sendFile(path.join(__dirname, '/../public/views/index.html'));
});

router.get('/success', function(request, response){
  response.sendFile(path.join(__dirname, '/../public/views/main.html'));
});

router.get('/fail', function(request, response){
  response.send('fail');
});

router.post('/login', passport.authenticate('local', {failureRedirect: '/fail'}), function(request, response){
  response.redirect('/success');
});

router.post('/register', function(req, res, next) {
  var saveUser = {
    username: req.body.username,
    password: encryptLib.encryptPassword(req.body.password)
  };
  pg.connect(connection, function(err, client, done) {
    client.query("INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
      [saveUser.username, saveUser.password],
        function (err, result) {
          client.end();

          if(err) {
            console.log("Error inserting data: ", err);
            next(err);
            res.send('registered');
          } else {
          res.redirect('/success');
          }
        });
  });
});

router.get('/userinfo', function(request, response){
  response.send(request.user);
});

router.get('/djqueue', function(request, response){
  var results = [];

  pg.connect(connection, function(err, client, done){
    var getQueue = client.query('SELECT * FROM djqueue');

    getQueue.on('row', function(row){
      results.push(row);
    });

    getQueue.on('end', function(){
      client.end();
      response.send(results);
    });
    if(err){
      console.log('djqueue ', err);
    }
  });
});

router.post('/addsongtoplaylist', function(request, response){
  var username = request.body.username;
  var songname = request.body.songname;
  var songid = request.body.songid;
  var imgurl = request.body.imgurl;

  pg.connect(connection, function(err, client, done){
    var addSong = client.query('INSERT INTO songs(username, songname, songid, imgurl, time) VALUES ($1, $2, $3, $4, now())', [username, songname, songid, imgurl], function(err, result){
      if(err){
        console.log(err);
        client.end();
      }else{
        console.log('song added');
        var results = [];
        var sendPlaylist = client.query('SELECT * FROM songs WHERE username = $1', [username]);
        sendPlaylist.on('row', function(row){
          results.push(row);
        });
        sendPlaylist.on('end', function(){
          client.end();
          response.send(results);
        });
      }
    });
  });
});

router.post('/getuserplaylist', function(request, response){
  var username = request.body.username;
  pg.connect(connection, function(err, client, done){
    var results = [];
    var sendPlaylist = client.query('SELECT * FROM songs WHERE username = $1', [username]);
    sendPlaylist.on('row', function(row){
      results.push(row);
    });
    sendPlaylist.on('end', function(){
      client.end();
      response.send(results);
    });
    if(err){
      console.log('error');
    };
  });
});

router.post('/removesong', function(request, response){
  var username = request.body.username;
  var songid = request.body.songid;
  pg.connect(connection, function(err, client, done){
    var removeSong = client.query('DELETE FROM songs WHERE username = $1 AND songid = $2', [username, songid], function(err, result){
      if(err){
        console.log(err)
      }else{
        console.log('song removed');
        var results = [];
        var sendPlaylist = client.query('SELECT * FROM songs WHERE username = $1', [username]);
        sendPlaylist.on('row', function(row){
          results.push(row);
        });
        sendPlaylist.on('end', function(){
          client.end();
          response.send(results);
        });
        if(err){
          console.log('error');
        };
      }
    });
  });
});

module.exports = router;
