/**
 * Perform various dynamic UI style changes
 */
(function(){
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
    },

    /**
     * Toggle Enabling/Disabling an input tag of the form
     * @param id: `id` attribute of input tag
     */
    toggleEditing: function (id) {
      const input = $('#' + id);
      if(input.attr("disabled")) {
        input.removeAttr("disabled");
        $('#checkbox_' + id).removeClass('glyphicon-unchecked').addClass('glyphicon-check');
      } else {
        input.attr("disabled", "disabled");
        $('#checkbox_' + id).removeClass('glyphicon-check').addClass('glyphicon-unchecked');
      }
    },

    /**
     * Get Query Parameter from URL
     * @param name: key of the query parameter
     * @param url: url from where the query string is received
     * @returns string: value of the query parameter
     */
    getParameterByName: function(name, url) {
      if (!url) url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    },

    /**
     * Disable a button
     * @param id: `id` attribute of button tag
     */
    disableButton: function (id) {
      const button = $('#' + id);
      if (!button.attr("disabled")) {
        button.attr("disabled", "disabled");
      }
    },

    /**
     * Enable a button
     * @param id: `id` attribute of button tag
     */
    enableButton: function (id) {
      const button = $('#' + id);
      if (button.attr("disabled")) {
        button.removeAttr("disabled");
      }
    },

    /**
     * Showing a spinner of performing an AJAX request
     * @param id: `id` attribute of the HTML tag group
     */
    loadingChanges: function (id) {
      $('#' + id + '-load').css("display", "inherit");
      $('#' + id + '-check').css("display", "none");
      $('#' + id + '-cross').css("display", "none");
    },

    /**
     * Showing a check mark after receiving a successful response
     * @param id: `id` attribute of the HTML tag group
     */
    successfulChanges: function (id) {
      $('#' + id + '-load').css("display", "none");
      $('#' + id + '-check').css("display", "inherit");
      $('#' + id + '-cross').css("display", "none");
    },

    /**
     * Showing a cross mark after receiving an error response
     * @param id: `id` attribute of the HTML tag group
     */
    failedChanges: function (id) {
      $('#' + id + '-load').css("display", "none");
      $('#' + id + '-check').css("display", "none");
      $('#' + id + '-cross').css("display", "inherit");
    }
  };
})();
