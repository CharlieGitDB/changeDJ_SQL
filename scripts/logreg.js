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
  setLoginRegisterView();
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
    $('.login').prop('disabled', true);
    var user = {username: $('.loginUser').val(), password: $('.loginPass').val()};
    $.ajax({
      method: 'POST',
      url: '/login',
      data: user
    }).done(function(response){
      if(response == 'fail'){
        $('.login').prop('disabled', false);
        $('.loginError').show().delay(5000).fadeOut();
      }else{
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
      $.ajax({
        method: 'POST',
        url: '/register',
        data: user
      }).done(function(response){
        if(response == 'registered'){
          writeError('Username is taken.');
        }else{
          localStorage.setItem('hasUserBeenHere', true);
          $('.registerContainer').hide();
          $('.suggestSwapSpan').text('If you don\'t have an account one you may register.');
          $('.suggestSwapBtn').text('Register');
          $('.loginContainer, .suggestSwapBox').show();
          $('.loginUser').focus();
          $('#loginForm').append('<p class="regSuccess">You have sucessfully registered.</p>');
          $('.regSuccess').delay(5000).fadeOut();
        }
      });
    };
  });
}

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
