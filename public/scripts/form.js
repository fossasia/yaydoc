
/**
 * Client-side Event Handling
 */
$(function () {
  var socket = io();

  /**
   * Handling Documentation Generation
   */
  $("#btnGenerate").click(function () {
    var formData = getData();

    if (validation.isValid(formData)) {
      socket.emit('execute', formData);
      $(this).attr("disabled", "none");
    } else {
      $('.notification').append($('<li>')).text(validation.getMessages());
      $('#notification-container').css("visibility", "visible");
      $('#notification-container').css("opacity", "1");
      validation.setMessages([]);
      setTimeout(function() {
        $('#notification-container').css("visibility", "hidden");
        $('#notification-container').css("opacity", "0");
      }, 5000)
    }

  });

  socket.on('logs', function (data) {
    $('#messages').append($('<li class="info">').text(data.data));
    $("#progress").css("width", data.donePercent + "%");
  });

  socket.on('err-logs', function (msg) {
    $('#messages').append($('<li class="error">').text(msg));
  });

  socket.on('success', function (data) {
    $('#btnDownload').css("display", "inline");
    $('#btnDownload').attr("href", "/download/" + data.email +"/" + data.uniqueId);
    $('#btnPreview').css("display", "inline");
    $('#btnPreview').attr("href", "/preview/" + data.email +"/" + data.uniqueId + "_preview");
    $('.notification').append($('<li>')).text("Documentation Generated Successfully");
    $('#notification-container').css("visibility", "visible");
    $('#notification-container').css("opacity", "1");
    setTimeout(function() {
      $('#notification-container').css("visibility", "hidden");
      $('#notification-container').css("opacity", "0");
    }, 5000)
    if (validation.isGithubHTTPS(data.gitUrl)) {
      $('#btnDeployGithub').css("display", "inline");
      $('#onetimeDeploy').attr("href", '/github?email='+data.email+'&uniqueId='+data.uniqueId+'&gitURL='+data.gitUrl);
    }
    $('#btnDeployHeroku').css("display", "inline");

    /**
     * Handling Heroku Deployment
     */
    $("#btnHerokuDeploy").click(function () {
      $("#herokuModal").modal('hide');
      $("#messages").innerHTML = '';
      var formData = getData();
      formData.uniqueId = data.uniqueId;
      socket.emit('heroku-deploy', formData);
    });
  });

  socket.on('failure', function (data) {
    $('.notification').append($('<li>')).text("Failed to Generate Documentation: Error " + data.errorCode);
    $('#notification-container').css("visibility", "visible");
    $('#notification-container').css("opacity", "1");
    setTimeout(function() {
      $('#notification-container').css("visibility", "hidden");
      $('#notification-container').css("opacity", "0");
    }, 5000)
  })

  socket.on('heroku-success', function (data) {
    $('.notification').append($('<li>')).text("Documentation deployed successfully to Heroku at: " + data.url);
    $('#notification-container').css("visibility", "visible");
    $('#notification-container').css("opacity", "1");
    setTimeout(function() {
      $('#notification-container').css("visibility", "hidden");
      $('#notification-container').css("opacity", "0");
    }, 5000)
  });
});

/**
 * Retrieve data from input form fields
 */
function getData() {
  var data = {};
  var formData = $("form").serializeArray();
  $.each(formData, function (i, field) {
    if (field.name === "email") { data.email = field.value.trim(); }
    if (field.name === "git_url") { data.gitUrl = field.value.trim(); }
    if (field.name === "doc_theme") { data.docTheme = field.value.trim(); }
    if (field.name === "debug" ) { data.debug = field.value; }
    if (field.name === "heroku_api_key" ) { data.herokuAPIKey = field.value.trim(); }
    if (field.name === "heroku_app_name" ) { data.herokuAppName = field.value.trim(); }
  });

  return data;
}
