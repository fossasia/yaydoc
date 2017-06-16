
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
    $('#btnDeploy').css("display", "inline");
    $('#btnDeploy').attr("href", '/github?email='+data.email+'&uniqueId='+data.uniqueId+'&gitURL='+data.gitUrl);
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
});

/**
 * Retrieve data from input form fields
 */
function getData() {
  var data = {};
  var formData = $("form").serializeArray();
  $.each(formData, function (i, field) {
    if (field.name === "email") { data.email = field.value; }
    if (field.name === "git_url") { data.gitUrl = field.value; }
    if (field.name === "doc_theme") { data.docTheme = field.value; }
  });

  return data;
}
