(function(){

  window.styles = {
    showNotification: function (message) {
      $('.notification').append($('<li>')).text(message);
      $('#notification-container').css({"visibility": "visible", "opacity": "1"});
      setTimeout(function () {
        $('#notification-container').css({"visibility": "hidden", "opacity": "0"});
      }, 5000);
    },

    validInput: function (id) {
      $('#' + id + '-group').addClass("has-success").removeClass("has-error has-warning");
      $('#' + id +'-span').addClass("glyphicon-ok").removeClass("glyphicon-remove glyphicon-warning-sign");
    },

    invalidInput: function (id) {
      $('#' + id + '-group').addClass("has-error").removeClass("has-success has-warning");
      $('#' + id +'-span').addClass("glyphicon-remove").removeClass("glyphicon-ok glyphicon-warning-sign");
    },

    warningInput: function (id) {
      $('#' + id + '-group').addClass("has-warning").removeClass("has-success has-error");
      $('#' + id +'-span').addClass("glyphicon-warning-sign").removeClass("glyphicon-ok glyphicon-remove");
    }
  };
})();

