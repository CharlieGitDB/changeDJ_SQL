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
      response.send('yes');
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
          } else {
            //change this to send to main page
          res.redirect('/sucess');
          }
        });
  });
});


module.exports = router;
