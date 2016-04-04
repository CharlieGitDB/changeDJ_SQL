//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
//[1]GLOBAL VARS                               [1]//
//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
localStorage.hasUserBeenHere;

//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
//[1]DOCUMENT READY                            [1]//
//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
$(function(){
  start();
});

//[x]||||||||||||||||||||||||||||||||[x]//
//[2]INIT FUNCTION                   [2]//
//[x]||||||||||||||||||||||||||||||||[x]//
function start(){
  isUserAuthenticated();
  loginRun();
  registerRun();
  swapRegisterLogic();
}


//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
//[1]FUNCTIONS                                 [1]//
//[x]||||||||||||||||||||||||||||||||||||||||||[x]//

//[x]||||||||||||||||||||||||||||||||[x]//
//[2]LOGIN/REGISTER FUNCTION         [2]//
//[x]||||||||||||||||||||||||||||||||[x]//
function loginRun(){
  $('#loginForm').submit(function(e){
    e.preventDefault();
    var user = {remember: $('loginRemember').is(':checked'), username: $('.loginUser').val(), password: $('.loginPass').val()};
    $.ajax({
      method: 'POST',
      url: '/login',
      data: user
    }).done(function(response){
      console.log(response);
      if(response == 'fail'){
        $('.loginError').show().delay(5000).fadeOut();
      }else{
        //may need to fix
        $('body').html(response);
      }
    });
  });
}

function registerRun(){
  function writeError(err){
    $('.registerError').text(err);
    $('.registerError').show();
  }

  $('#registerForm').submit(function(e){
    e.preventDefault();
    if($('.registerPass').val() != $('.registerPass2').val()){
        writeError('Passwords must match');
    }
    if($('.registerUser').val().length < 3){
      writeError('Username must be at least 3 characters long.');
    }
    if($('.registerPass').val().length < 5 || $('.registerPass2').val().length < 5){
      writeError('Password must be at least 5 characters long.');
    }
    if($('.registerUser').val().length >= 3 && $('.registerPass').val().length >= 5 && $('.registerPass2').val().length >= 5 &&  $('.registerPass').val() == $('.registerPass2').val()){
      var user = {username: $('.registerUser').val(), password: $('.registerPass').val()};
      console.log(user);
      $.ajax({
        method: 'POST',
        url: '/register',
        data: user
      }).done(function(response){
        $('body').html(response);
        localStorage.hasUserBeenBeenHere = true;
      });
    };
  });
}

//[x]||||||||||||||||||||||||||||||||[x]//
//[2]CHECK IF USER IS LOGGED IN      [2]//
//[x]||||||||||||||||||||||||||||||||[x]//
function isUserAuthenticated(){
  $.ajax({
    method: 'GET',
    url: '/isuserloggedin'
  }).done(function(response){
    if(response == 'yes'){
      // if(mainPageCounter == 0){
      //   mainPageLogic();
      //   mainPageCounter++;
      // }
      console.log('logged in');
    }else{
      setLoginRegisterView();
    }
  });
};

//[x]||||||||||||||||||||||||||||||||[x]//
//[2]SET LOGIN REGISTER VIEW         [2]//
//[x]||||||||||||||||||||||||||||||||[x]//
function setLoginRegisterView(){
  $('.loaderBody, .spinner').hide();
  $('.logoContainer').show();
  if(localStorage.hasUserBeenHere == undefined){
    $('.registerContainer, .hasAcctBox').show();
    $('.registerUser').focus();
  }else{
    $('.loginContainer, .noAcctBox').show();
    $('.loginUser').focus();
  }
}

//[x]||||||||||||||||||||||||||||||||[x]//
//[2]SWAP REGISTER/LOGIN VIEW LOGIC  [2]//
//[x]||||||||||||||||||||||||||||||||[x]//
function swapRegisterLogic(){
  $('body').on('click', '.suggestSwapBtn', function(){
    $(':input').val('');
    if($(this).text() == 'Register'){
      $('.noAcctBox, .loginContainer').fadeOut();
      $('.hasAcctBox, .registerContainer').delay(400).fadeIn();
    }else{
      $('.hasAcctBox, .registerContainer').fadeOut();
      $('.noAcctBox, .loginContainer').delay(400).fadeIn();
    }
  });
}
