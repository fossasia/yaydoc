
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

    if (validation.isValidForm(formData)) {
      socket.emit('execute', formData);
      $(this).attr("disabled", "none");
    } else {
      styles.showNotification(validation.getMessages());
      validation.setMessages([]);
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
    styles.showNotification("Documentation Generated Successfully");
    if (validation.isGithubHTTPS(data.gitUrl)) {
      $('#btnDeployGithub').css("display", "inline");
      $('#onetimeDeploy').attr("href", '/auth/github?email='+data.email+'&uniqueId='+data.uniqueId+'&gitURL='+data.gitUrl);
    }
    $('#btnDeployHeroku').css("display", "inline");
    $('#btnDeployHeroku').attr("href", '/auth/heroku?email='+data.email+'&uniqueId='+data.uniqueId);
  });

  socket.on('failure', function (data) {
    styles.showNotification("Failed to Generate Documentation: Error " + data.errorCode);
  })
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
