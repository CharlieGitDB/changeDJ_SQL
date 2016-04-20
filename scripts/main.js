//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
//[1]MAIN PAGE GLOBAL VARIABLES                [1]//
//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
var mainPageCounter = 0;
var socket;
var userInfo;
var userPlaylist;
var isVideoPlaying = 0;

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
    var sendMe = {username: userInfo.username};
    $.ajax({
      method: 'POST',
      url: '/getuserplaylist',
      data: sendMe
    }).done(function(response){
      updatePlaylist(response);
    });
  });

  $.ajax({
    method: 'GET',
    url: '/djqueue'
  }).done(function(response){
    updateQueue(response);
  });

  //[x]||||||||||||||||||||||||||||||||[x]//
  //[2]HEADER MENU LOGIC               [2]//
  //[x]||||||||||||||||||||||||||||||||[x]//
  $('body').on('click', '.logout', function(){
    socket.emit('leave dj', userInfo.username);
    socket.emit('dj queue');
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
      $('.searchInput').focus();
    }else{
      $('.playlistContent').show();
      $('.addSongContent').hide();
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
      url: 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&order=viewCount&type=video&q='+ q + '&videoSyndicated=true&videoEmbeddable=true&key=AIzaSyBRtVVHPmgkcUe36EUdHN-yWetm7-IjIO0'
    }).done(function(response){
      console.log(response);
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
    console.log(response);
    $('.playlistContent').empty();
    if(response.length == 0){
      $('.playlistContent').text('You currently have no songs in your playlist.');
    }else{
      userPlaylist = response;
      $('.playlistContent').append('<ul class="playlistContentList"></ul>');
      var songIdData = 0;
      for(var i = 0; i < userPlaylist.length; i++){
        $('.playlistContentList').append('<li class="playlistContentListItem searchedVideoDiv"><div class="moveSongToFirst option" id="moveSongToFirst'+songIdData+'">&#8593;</div><button class="removeSongBtn redBtn" id="removeSongBtn'+songIdData+'">-</button><img src="'+userPlaylist[i].imgurl+'" class="playlistIMG"/><br><span class="playlistSongName">'+userPlaylist[i].songname+'</span></li>');
        $('#removeSongBtn'+songIdData).data('songid', userPlaylist[i].songid);
        $('#moveSongToFirst'+songIdData).data('song', userPlaylist[i]);
        songIdData++;
      }
      $('.moveSongToFirst').hide();
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
}
