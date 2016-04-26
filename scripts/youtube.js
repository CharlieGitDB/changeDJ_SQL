var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: $('.rightContainer').width() / 2.2,
    width: $('.rightContainer').width(),
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': onPlayerError
    },
    playerVars: {
      controls: 0,
      disabled: 1
    }
  });
}

function onPlayerError(event){
  console.log(event);
}

function onPlayerReady(event){

}

function onPlayerStateChange(event){
  if(event.data === 0){
    console.log('video done');
    socket.emit('song finished', userInfo.username);
  }

  if(event.data === 1){
    console.log('playing');
    var vidTitle = player.getVideoData().title;
    $('.videoTitle').text(vidTitle);
    $('.playlistContentList li').css('background', '#34509D');
    if(iAmDJ == true){
      // $('.playlistSongName:contains('+vidTitle+')').parent().css('background', '#56C247');
      $('.playlistSongName').filter(function(){
        return $(this).text() === vidTitle;
      }).parent().css('background', '#56C247');
    }
  }
}

function playSong(id, seconds){
  player.loadVideoById({'videoId': id, 'startSeconds': seconds});
}

socket.on('play song', function(song){
  playSong(song);
});
