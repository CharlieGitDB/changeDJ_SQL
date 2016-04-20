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
  console.log('nada');
}

function onPlayerStateChange(event){
  if(event.data === 0){
    console.log('video done');
    //when song ends, then what?
    //if error send to socket, if socket sees that you are in dj list you will be removed otherwise your vote is added to the song being over, when the votes correlate with the number of people in the dj list the dj and video changes

    //when user joins ask for video time if a song is playing send back the time person starts playing

    socket.emit('song finished', userInfo.username);
    isVideoPlaying = 0;
  }

  if(event.data === 1){
    console.log('playing');
    isVideoPlaying = 1;
  }
}

function playSong(id, seconds){
  player.loadVideoById({'videoId': id, 'startSeconds': seconds});
}

socket.on('play song', function(song){
  playSong(song);
});
