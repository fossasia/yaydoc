(function(){

  var obj = {
    validInput: function (id) {
      $('#' + id + '-group').addClass("has-success").removeClass("has-error");
      $('#' + id +'-span').addClass("glyphicon-ok").removeClass("glyphicon-remove");
    },
    
    invalidInput: function (id) {
      $('#' + id + '-group').addClass("has-error").removeClass("has-success");
      $('#' + id +'-span').addClass("glyphicon-remove").removeClass("glyphicon-ok");
    },
    
    showNotification: function (message) {
      $('.notification').append($('<li>')).text(message);
      $('#notification-container').css({"visibility": "visible", "opacity": "1"});
      setTimeout(function() {
        $('#notification-container').css({"visibility": "hidden", "opacity": "0"});
      }, 5000);
    }
  };
  
  if ((typeof module) === 'undefined') {
    window.styles = obj;
  } else {
    module.exports = obj;
  }
})();

