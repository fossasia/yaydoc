(function(){

  window.styles = {
    showNotification: function (message) {
      $('.notification').append($('<li>')).text(message);
      $('#notification-container').css({"visibility": "visible", "opacity": "1"});
      setTimeout(function() {
        $('#notification-container').css({"visibility": "hidden", "opacity": "0"});
      }, 5000);
    }
  };
})();

