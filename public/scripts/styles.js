/**
 * Perform various dynamic UI style changes
 */
(function(){
  window.history.pushState("", "", location.pathname);
  window.styles = {
    /**
     * Display Notification panel for 5 seconds
     * @param message: Messages to display
     */
    showNotification: function (message) {
      $('.notification').append($('<li>')).text(message);
      $('#notification-container').css({"visibility": "visible", "opacity": "1"});
      setTimeout(function () {
        $('#notification-container').css({"visibility": "hidden", "opacity": "0"});
      }, 5000);
    },

    /**
     * Change the border color to green with an `ok` mark on valid input
     * @param id: Value of `id` attribute for input tag
     */
    validInput: function (id) {
      $('#' + id + '-group').addClass("has-success").removeClass("has-error has-warning");
      $('#' + id +'-span').addClass("glyphicon-ok").removeClass("glyphicon-remove glyphicon-warning-sign");
    },

    /**
     * Change the border color to red with a `cross` mark on invalid input
     * @param id: Value of `id` attribute for input tag
     */
    invalidInput: function (id) {
      $('#' + id + '-group').addClass("has-error").removeClass("has-success has-warning");
      $('#' + id +'-span').addClass("glyphicon-remove").removeClass("glyphicon-ok glyphicon-warning-sign");
    },

    /**
     * Change the border color to yellow with a `warning` mark on warning input
     * @param id: Value of `id` attribute for input tag
     */
    warningInput: function (id) {
      $('#' + id + '-group').addClass("has-warning").removeClass("has-success has-error");
      $('#' + id +'-span').addClass("glyphicon-warning-sign").removeClass("glyphicon-ok glyphicon-remove");
    }
  };
})();
