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

router.get('/isuserloggedin', function(request, response){
    if(request.isAuthenticated() == true){
      response.redirect('/success');
    } else {
      response.send('no');
    }
});

router.get('/success', function(request, response){
  response.sendFile(path.join(__dirname, '/../public/views/main.html'));
});

router.get('/fail', function(request, response){
  response.send('fail');
});

router.post('/login', passport.authenticate('local', {failureRedirect: '/fail'}), function(request, response){
  if(request.body.remember == true){
    request.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
  }else{
    request.session.cookie.expires = false;
  }
  response.redirect('/success');
});

router.get('/logout', function(request,response){
  request.logout();
  response.send('logged out');
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

router.post('/removedj', function(request, response){
  var username = request.body.username;

  pg.connect(connection, function(err, client, done){
    var removeDJ = client.query('DELETE FROM djqueue WHERE username = $1', [username], function(err, result){
      if(err){
        console.log('error', err);
      }else{
        console.log('deleted');
        response.send('left');
        client.end();
      }
    });
  });
});

router.post('/joindj', function(request, response){
    var username = request.body.username;

    pg.connect(connection, function(err, client, done){
      var leaveDJ = client.query('INSERT INTO djqueue VALUES ($1)', [username], function(err, result){
        if(err){
          console.log('joindj err', err);
        }else{
          console.log('joined');
          response.send('joined');
          client.end();
        }
      });
    });
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

module.exports = router;
