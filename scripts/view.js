//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
//[1]JQUERY RESPONSIVE DESIGN                  [1]//
//[x]||||||||||||||||||||||||||||||||||||||||||[x]//
$(window).resize(function(){
  $('#player').css({
    'width': $('.rightContainer').width(),
    'height': $('.rightContainer').width() / 2
  });

  $('.chatMessages').css({
    'max-height': $(window).height() / 3.5
  });

  $('.djQueue ul').css({
    'max-height': $(window).height() / 2
  });
});
