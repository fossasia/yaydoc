/**
 * Client-side Event Handling for deploy/github
 */
$(function () {
  var socket = io();
  socket.emit('ghpages-deploy', data);

  socket.on('github-deploy-logs', function (data) {
    $('#messages').append($('<li class="info-logs">').text(data.data));
    $("#progress").css("width", data.donePercent + "%");
  });

  socket.on('github-error-logs', function (data) {
    $('#messages').append($('<li class="danger-logs">').text(data));
  });

  socket.on('github-success', function (data) {
    styles.showNotification("Documentation deployed successfully to Github Pages!");
    $("#progress").css("width", "100%");
    $("#btnGithubPages").css("display", "inline").attr("href", data.pagesURL);
  });

  socket.on('github-failure', function (data) {
    styles.showNotification("Failed to deploy documentation: Error " + data.errorCode);
  });
});