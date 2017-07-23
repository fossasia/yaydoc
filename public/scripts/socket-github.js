/**
 * Client-side Event Handling for deploy/github
 */
$(function () {
  var socket = io();

  /**
   * Handling Github Pages deployment
   */
  socket.emit('ghpages-deploy', data);

  /**
   * Retrieving standard logs from Github Pages deployment
   */
  socket.on('github-deploy-logs', function (data) {
    $('#messages').append($('<li class="info-logs">').text(data.data));
    $("#progress").css("width", data.donePercent + "%");
  });

  /**
   * Retrieving erroneous logs from Github Pages deployment
   */
  socket.on('github-error-logs', function (data) {
    $('#messages').append($('<li class="danger-logs">').text(data));
  });

  /**
   * Actions performed on a successful Github Pages deployment
   */
  socket.on('github-success', function (data) {
    styles.showNotification("Documentation deployed successfully to Github Pages!");
    $("#progress").css("width", "100%");
    $("#btnGithubPages").css("display", "inline").attr("href", data.url);

    $('#btnLogs').css("display", "inline");
    $("#btnLogs").click(function () {
      socket.emit('retrieve-ghpages-deploy-logs', {email: data.email, uniqueId: data.uniqueId});
      $('#downloadDetailedLogs').attr('href', '/logs/ghpages_deploy/' + data.email + '/' + data.uniqueId);
    });
  });

  /**
   * Actions performed on a failure in Github Pages deployment
   */
  socket.on('github-failure', function (data) {
    styles.showNotification("Failed to deploy documentation: Error " + data.code);

    $('#btnLogs').css("display", "inline");
    $("#btnLogs").click(function () {
      socket.emit('retrieve-ghpages-deploy-logs', {email: data.email, uniqueId: data.uniqueId});
      $('#downloadDetailedLogs').attr('href', '/logs/ghpages_deploy/' + data.email + '/' + data.uniqueId);
    });
  });

  /**
   * Displaying detailed logs in a modal
   */
  socket.on('file-content', function(data){
    new Clipboard('#copy-button');
    $('#detailed-logs').html(data);
    $('#detailed-logs-modal').modal('show');
  });

  /**
   * Notification on a successful copy operation on logs
   */
  $('#copy-button').click(function () {
    styles.showNotification('Logs copied to clipboard!');
  })
});