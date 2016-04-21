//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
//[1]GLOBAL VARS                               [1]//
//[x]||||||||||||||||||||||||||||||||||||||||||[x]//


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
      if(response == 'fail'){
        $('.loginError').show().delay(5000).fadeOut();
      }else{
        //may need to fix

        $('body').html(response).promise().done(function(){
          if(mainPageCounter == 0){
            mainPageLogic();
            mainPageCounter++;
          }
        });
      }
    });
  });
}

function registerRun(){
  function writeError(err){
    $('.registerError').text(err);
    $('.registerError').show();
    $('.registerError').delay(5000).fadeOut();
  }

  $('#registerForm').submit(function(e){
    e.preventDefault();
    if($('.registerPass').val() != $('.registerPass2').val()){
        writeError('Passwords must match.');
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
        if(response == 'registered'){
          writeError('Username is taken.');
        }else{
          $('body').html(response);
          localStorage.setItem('hasUserBeenHere', true);
          if(mainPageCounter == 0){
            mainPageLogic();
            mainPageCounter++;
          }
        }
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
    if(response == 'no'){
      setLoginRegisterView();
    }else{
      $('body').html(response);
      if(mainPageCounter == 0){
          mainPageLogic();
          mainPageCounter++;
      }
    }
  });
};

//[x]||||||||||||||||||||||||||||||||[x]//
//[2]SET LOGIN REGISTER VIEW         [2]//
//[x]||||||||||||||||||||||||||||||||[x]//
function setLoginRegisterView(){
  $('.loaderBody, .spinner').hide();
  $('.logoContainer').show();
  if(localStorage.getItem('hasUserBeenHere') == undefined){
    $('.suggestSwapSpan').text('If you already have an account you may login.');
    $('.suggestSwapBtn').text('Login');
    $('.registerContainer, .suggestSwapBox').show();
    $('.registerUser').focus();
  }else{
    $('.suggestSwapSpan').text('If you don\'t have an account one you may register.');
    $('.suggestSwapBtn').text('Register');
    $('.loginContainer, .suggestSwapBox').show();
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
      $('.loginContainer').hide('clip',{complete:function(){$('.registerContainer').show('clip');}});
      $(this).text('Login');
      $('.suggestSwapSpan').text('If you already have an account you may login.');
    }else if($(this).text() == 'Login'){
      $('.registerContainer').hide('clip',{complete:function(){$('.loginContainer').show('clip');}});
      $(this).text('Register');
      $('.suggestSwapSpan').text('If you don\'t have an account one you may register.');
    }
  });
}
