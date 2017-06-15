/**
 * Client-side Event Handling
 */
$(function () {
  var socket = io();
  $("#btnGenerate").click(function () {
    var formData = getData();
    socket.emit('execute', formData);
    $(this).attr("disabled", "none");
  });
  socket.on('logs', function (data) {
    $('#messages').append($('<li>').text(data.data));
    $("#progress").css("width", data.donePercent + "%");
  });
  socket.on('err-logs', function (msg) {
    $('#messages').append($('<li>').text(msg));
  });
  socket.on('success', function (data) {
    $('#btnDownload').css("display", "block");
    $('#btnDownload').attr("href", "/download/" + data.email +"/" + data.uniqueId);
    $('#btnPreview').css("display", "block");
    $('#btnPreview').attr("href", "/preview/" + data.email +"/" + data.uniqueId + "_preview");
  });
});

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
