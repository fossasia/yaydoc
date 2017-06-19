
/**
 * Client-side Event Handling
 */
$(function () {
  var socket = io();
  $("#btnGenerate").click(function () {
    var formData = getData();

    if (validation.isValid(formData)) {
      socket.emit('execute', formData);
      $(this).attr("disabled", "none");
    } else {
      styles.showNotification(validation.getMessages());
      validation.setMessages([]);
    }
  });

  $('#username').blur(function () {
    if (validation.validateUsername($('#username').val()) === true) {
      styles.validInput('username');
      $('#reponame').attr("disabled", false);
    } else {
      styles.invalidInput('username');
      $('#reponame').attr("disabled", true);
    }
  });

  $('#reponame').blur(function () {
    if (validation.validateReponame($('#username').val(), $('#reponame').val()) === true) {
      styles.validInput('reponame');
    } else {
      styles.invalidInput('reponame');
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
    $('#btnDownload').css("display", "inline").attr("href", "/download/" + data.email +"/" + data.uniqueId);
    $('#btnPreview').css("display", "inline").attr("href", "/preview/" + data.email +"/" + data.uniqueId + "_preview");
    $('#btnDeploy').css("display", "inline").attr("href", '/github?email='+data.email+'&uniqueId='+data.uniqueId+
      '&username='+data.username+'&reponame='+data.reponame);
    styles.showNotification("Documentation Generated Successfully");
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
    if (field.name === "username") { data.username = field.value.trim(); }
    if (field.name === "reponame") { data.reponame = field.value.trim(); }
    if (field.name === "doc_theme") { data.docTheme = field.value.trim(); }
  });

  return data;
}
