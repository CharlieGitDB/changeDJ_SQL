//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
//[1]MAIN PAGE GLOBAL VARIABLES                [1]//
//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
var mainPageCounter = 0;
var socket;
var userInfo;

//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
//[1]MAIN PAGE LOGIC                           [1]//
//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
function mainPageLogic(){
  socket = io();

  $.getScript('/scripts/youtube.min.js').done(function(){
    $('.chatMessages').css({
      'max-height': $(window).height() / 3.5
    });
    $('.djQueue ul').css({
      'max-height': $(window).height() / 2
    });

    $.ajax({
      method: 'GET',
      url: '/djqueue'
    }).done(function(response){
      updateQueue(response);
    });
  });

  window.onbeforeunload = function(){
    var user = {username: userInfo.username};
    $.ajax({
      method: 'POST',
      url: '/removedj',
      async: false,
      data: user
    }).done(function(response){
      console.log(response);
    });
  }

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]GRAB USERS INFORMATION          [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  $.ajax({
    method: 'GET',
    url: '/userinfo'
  }).done(function(response){
    userInfo = response;
    console.log(userInfo);
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]HEADER MENU LOGIC               [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  $('body').on('click', '.logout', function(){
    $.ajax({
      method: 'GET',
      url: '/logout',
    }).done(function(response){
      if(response == 'logged out'){
        location.reload();
      }
    });
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]LEFT MENU LOGIC                 [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  $('body').on('click', '.mainOptionsBtn', function(){
    $('.mainOptionsBtn').toggleClass('redBtn');
    if($(this).text() == 'Add Songs'){
      $('.playlistContent').hide();
      $('.addSongContent').show();
    }else{
      $('.playlistContent').show();
      $('.addSongContent').hide()
    }
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]CHAT LOGIC                      [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  $('.chatInput').on('keyup', function(e){
    e.preventDefault();
    if(e.which == 13){
      if ($(this).val().match(/^\s*$/)) {
          alert('Message cannot be blank');
      }else if($(this).val().length > 200){
        alert('200 character limit');
      } else {
        var userNameAndMsg = {userId: userInfo.username, msg: $(this).val()};
        socket.emit('user chat message', userNameAndMsg);
        $(this).val('');
      }
    }
  });

  socket.on('user chat message', function(idmsg){
    $('.chatMessages ul').append('<li><span style="color: '+idmsg.color+';">'+idmsg.userId+'</span>: '+idmsg.msg+'</li>');
    $('.chatMessages').scrollTop($('.chatMessages ul').height());
    // if($('.chatboxcontainerbtn').css('display') != 'none' && $('.chatboxoptionview').css('display') == 'none'){
    //   $('.chatboxcontainerbtn').text('Chat *');
    // }
  });

  $('body').on('click', '.try', function(){
    socket.emit('play song', 'Ly7uj0JwgKg');
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]JOIN/LEAVE DJ QUEUE             [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  $('body').on('click', '.joinDJ', function(){
    var user = {username: userInfo.username};
    $.ajax({
      method: 'POST',
      url: '/joindj',
      data: user
    }).done(function(response){
      if(response == 'joined'){
        $('.joinDJ').hide();
        $('.leaveDJ').show();
        socket.emit('dj queue');
      }
    });
  });

  $('body').on('click', '.leaveDJ', function(){
    var user = {username: userInfo.username};
    $.ajax({
      method: 'POST',
      url: '/removedj',
      data: user
    }).done(function(response){
      if(response == 'left'){
        $('.leaveDJ').hide();
        $('.joinDJ').show();
        socket.emit('dj queue');
      }
    });
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]UPDATE DJ QUEUE                 [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  function updateQueue(response){
    $('.djQueue ul').empty();
    if(response.length != 0){
      $('.noDJ').hide();
      $('.djQueue ul').show();
    }else{
      $('.djQueue ul').hide();
      $('.noDJ').show();
    }
    for(var i = 0; i < response.length; i++){
      $('.djQueue ul').append('<li>'+response[i].username+'</li>');
    };
  }

  socket.on('dj queue', function(){
    $.ajax({
      method: 'GET',
      url: '/djqueue'
    }).done(function(response){
      updateQueue(response);
    });
  });
}
