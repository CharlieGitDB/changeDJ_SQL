//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
//[1]JQUERY RESPONSIVE DESIGN                  [1]//
//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
$(window).resize(function(){
  if($(window).width() < 850){
    $('.mainOptionsBtn').css({
      'width': '99%',
      'float': 'none'
    });
  }else{
    $('.mainOptionsBtn').css({
      'width': '49%',
      'float': 'left'
    });
  }

  $('#player').css({
    'width': $('.rightContainer').width(),
    'height': $('.rightContainer').width() / 2.2
  });

  $('.chatMessages').css({
    'max-height': $(window).height() / 6.5
  });

  $('.djQueue ul').css({
    'max-height': $(window).height() / 2
  });

  $('.songSearch').css({
    'max-height': $(window).height() / 2.2
  });

  $('.playlistContent').css({
    'max-height': $(window).height() / 1.8
  });
});
