//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
//[1]MAIN PAGE GLOBAL VARIABLES                [1]//
//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
var mainPageCounter = 0;
var socket;
var userInfo;
var userPlaylist;
var iAmDJ = false;

//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
//[1]MAIN PAGE LOGIC                           [1]//
//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
function mainPageLogic(){
  socket = io();

  $.getScript('/scripts/youtube.min.js').done(function(){
    if($(window).width() < 850){
      $('.mainOptionsBtn').css({
        'width': '99%',
        'float': 'none'
      });
    }

    $('.chatMessages').css({
      'max-height': $(window).height() / 6.5
    });
    $('.djQueue ul').css({
      'max-height': $(window).height() / 2
    });

    $('.songSearches').css({
      'max-height': $(window).height() / 2.2
    });

    $('.playlistContent').css({
      'max-height': $(window).height() / 1.8
    });
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]WHEN USER LEAVES TAB            [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  window.onbeforeunload = function(){
    socket.emit('leave dj', userInfo.username);
    socket.emit('dj queue');
    socket.emit('leave userlist', userInfo.username);
    $.ajax({
      method: 'GET',
      url: '/logout'
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
    var sendMe = {username: userInfo.username};
    $.ajax({
      method: 'POST',
      url: '/getuserplaylist',
      data: sendMe
    }).done(function(response){
      updatePlaylist(response);

      $.ajax({
        method: 'GET',
        url: '/djqueue'
      }).done(function(response){
        updateQueue(response);
        socket.emit('join userlist', userInfo.username);
      });
    });
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]HEADER MENU LOGIC               [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  $('body').on('click', '.dropdown', function(){
    if(!$('.dropdownList').is(':visible')){
      $('.dropdownList').css('display', 'block');
    }else{
      $('.dropdownList').hide();
    }
  });

  $('body').on('click', '.mainContainer', function(){
    if($('.dropdownList').is(':visible')){
      $('.dropdownList').hide();
    }
  });

  $('body').on('click', '.chatCodes', function(){
    alert('This currently does nothing');
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]SET DRAGGABLES                  [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  $('.userListContainer').draggable({ handle: '.userListHeader', containment: 'document' });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]USER LIST                       [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  $('body').on('click', '.userList', function(){
    socket.emit('get userlist');
  });

  socket.on('get userlist', function(userList){
    $('.userListList').empty();
    for(var i = 0; i < userList.length; i++){
      $('.userListList').append('<li>' + userList[i] + '</li>');
    }
    $('.userListContainer').show();
  });

  $('body').on('click', '.exitBtn', function(){
    $(this).parent().parent().hide();
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]LEFT MENU LOGIC                 [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  $('body').on('click', '.plBtn', function(){
    if(!$(this).hasClass('redBtn')){
      $(this).addClass('redBtn');
      $('.asBtn').removeClass('redBtn');
      $('.playlistContent').show();
      $('.addSongContent').hide();
    }
  });

  $('body').on('click', '.asBtn', function(){
    if(!$(this).hasClass('redBtn')){
      $(this).addClass('redBtn');
      $('.plBtn').removeClass('redBtn');
      $('.playlistContent').hide();
      $('.addSongContent').show();
      $('.searchInput').focus();
    }
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]CHAT LOGIC                      [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  var missedMsgCount = 0;
  var isFocused;
  function focusChange(){
    if(document.hidden){
      isFocused = false;
    }else{
      isFocused = true;
      missedMsgCount = 0;
      document.title = 'ChangeDJ';
    }
  }
  document.addEventListener('visibilitychange', focusChange, false);

  $('.chatInput').on('keyup', function(e){
    e.preventDefault();
    if(e.which == 13){
      if ($(this).val().match(/^\s*$/)) {
          alert('Message cannot be blank');
      }else if($(this).val().length > 200){
        alert('200 character limit');
      }else{
        if($(this).val().startsWith('img:')){
          var img = $(this).val().replace('img:', '');
          if(img.endsWith('.gif')){
            var msgVal = '<img src="'+ img + '" class="chatImg"/>';
            var userNameAndMsg = {userId: userInfo.username, msg: msgVal};
            socket.emit('user chat message', userNameAndMsg);
            $(this).val('');
          }else{
            alert('Invalid .gif url');
          }
        }else{
          var msgVal = $(this).val().replace(/[^a-z0-9]/gi,' ');
          var userNameAndMsg = {userId: userInfo.username, msg: msgVal};
          socket.emit('user chat message', userNameAndMsg);
          $(this).val('');
        }
      }
    }
  });

  socket.on('user chat message', function(idmsg){
    $('.chatMessages ul').append('<li><span style="color: '+idmsg.color+';">'+idmsg.userId+'</span>: '+idmsg.msg+'</li>');
    $('.chatMessages').scrollTop($('.chatMessages ul').height());
    if(isFocused == false){
      missedMsgCount++;
      document.title = '('+missedMsgCount+') ChangeDJ';
    }
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]JOIN/LEAVE DJ QUEUE             [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  $('body').on('click', '.joinDJ', function(){
    socket.emit('join dj', userInfo.username);
    $('.leaveDJ').show();
    $('.joinDJ').hide();
  });

  $('body').on('click', '.leaveDJ', function(){
    socket.emit('leave dj', userInfo.username);
    $('.leaveDJ').hide();
    $('.joinDJ').show();
    socket.emit('dj queue');
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

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]ADD TO PLAYLIST LOGIC           [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  var songIdArray = [];
  var imgUrlArray = [];
  function searchVideo(query){
    var q = encodeURIComponent(query).replace(/%20/g, "+");
    $.ajax({
      method: 'GET',
      url: 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&order=relevance&type=video&q='+ q + '&videoSyndicated=true&videoEmbeddable=true&key=AIzaSyBRtVVHPmgkcUe36EUdHN-yWetm7-IjIO0'
    }).done(function(response){
      for(var i = 0; i < response.items.length; i++){
        songIdArray.push(response.items[i].id.videoId);
        imgUrlArray.push(response.items[i].snippet.thumbnails.default.url);
        $('.songSearches').append('<div class="searchedVideoDiv"><div class="addSongToPlaylist btn">+</div><img src="'+response.items[i].snippet.thumbnails.default.url+'" class="centerSearchIMG"/><div class="clearfix"></div><span class="searchedVideoTitle">'+response.items[i].snippet.title+'</span></div>');
      }
    });
  }
  $('.searchInput').on('keyup', function(e){
    e.preventDefault();
    if(e.which == 13){
      songIdArray = [];
      imgUrlArray = [];
      $('.songSearches').empty();
      var search = $('.searchInput').val();
      searchVideo(search);
      $('.searchInput').val('');
    }
  });

  $('body').on('click', '.addSongToPlaylist', function(e){
    e.preventDefault();
    var theSpecificVideoDiv = $(this).parent();
    var theSpecificVideoText = $(this).parent().find('.searchedVideoTitle');
    var theSpecificImage = $(this).parent().find('.centerSearchIMG');
    var theSpecificButton = $(this).parent().find('.addSongToPlaylist');

    var songNameTrimmed = $(this).parent().text().substring(1);

    var idAndSongToAddToPlaylist = {username: userInfo.username, songname: songNameTrimmed, songid: songIdArray[$(this).parent().index()], imgurl: imgUrlArray[$(this).parent().index()]};

    $.ajax({
      method: 'POST',
      url: '/addsongtoplaylist',
      data: idAndSongToAddToPlaylist
    }).done(function(response){
      theSpecificVideoDiv.css('background', '#56C247');
      theSpecificImage.css('margin', '0px');
      theSpecificVideoText.text('Added to playlist!');
      theSpecificButton.hide();
      updatePlaylist(response);
    });
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]UPDATE PLAYLIST                 [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  function updatePlaylist(response){
    $('.playlistContent').empty();
    if(response.length == 0){
      $('.playlistContent').text('You currently have no songs in your playlist.');
      $('.djBtn').hide();
      socket.emit('leave dj', userInfo.username);
      socket.emit('dj queue');
    }else{
      if(!$('.joinDJ').is(':visible') && !$('.leaveDJ').is(':visible')){
        $('.joinDJ').show();
      }
      userPlaylist = response;
      $('.playlistContent').append('<ul class="playlistContentList"></ul>');
      var songIdData = 0;
      for(var i = 0; i < userPlaylist.length; i++){
        $('.playlistContentList').append('<li class="playlistContentListItem searchedVideoDiv"><div class="moveSongToLast option" id="moveSongToLast'+songIdData+'">&darr;</div><button class="removeSongBtn redBtn" id="removeSongBtn'+songIdData+'">-</button><img src="'+userPlaylist[i].imgurl+'" class="playlistIMG"/><br><span class="playlistSongName">'+userPlaylist[i].songname+'</span></li>');
        $('#removeSongBtn'+songIdData).data('songid', userPlaylist[i].songid);
        $('#moveSongToLast'+songIdData).data('song', userPlaylist[i]);
        songIdData++;
      }
      $('.moveSongToLast').hide();
    };
  }

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]DELETE SONG FROM PLAYLIST       [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  $('body').on('click', '.removeSongBtn', function(){
    var songToDelete = {username: userInfo.username, songid: $(this).data('songid')};
    $.ajax({
      method: 'POST',
      url: '/removesong',
      data: songToDelete
    }).done(function(response){
      updatePlaylist(response);
    });
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]SHOW CURRENT DJ                 [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  socket.on('current dj', function(username){
    if(userInfo.username == username){
      iAmDJ = true;
    }else{
      iAmDJ = false;
    }
    $('.djQueue ul li').css('background', '#34509D');
    $('.djQueue ul li').filter(function(){
      return $(this).text() === username;
    }).css('background', '#56C247');
  });
}
