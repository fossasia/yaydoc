/**
 * Client-side Event Handling for deploy/heroku
 */
$(function () {
  var socket = io();

  $("#herokuAppName").keyup(function () {
    validation.validateHerokuAppName($("#herokuAppName").val());
  });

  $("#btnRun").click(function () {
    var herokuAppName = $("#herokuAppName").val().trim();

    validation.setMessages([]);
    var status = validation.validateHerokuAppName(herokuAppName);
    if (status !== "valid") {
      styles.showNotification(validation.getMessages());
      validation.setMessages([]);
    }
    if (status !== "invalid") {
      $(this).attr("disabled", "none");
      data.herokuAppName = herokuAppName;
      socket.emit('heroku-deploy', data);
    }
  });

  socket.on('heroku-deploy-logs', function (data) {
    $('#messages').append($('<li class="info-logs">').text(data.data));
    $("#progress").css("width", data.donePercent + "%");
  });

  socket.on('heroku-error-logs', function (data) {
    $('#messages').append($('<li class="danger-logs">').text(data));
  });

  socket.on('heroku-success', function (data) {
    styles.showNotification("Documentation deployed successfully to Heroku!");
    $("#progress").css("width", "100%");
    $("#btnWebsiteLink").css("display", "inline").attr("href", data.url);
  });

  socket.on('heroku-failure', function (data) {
    styles.showNotification("Failed to deploy documentation: Error " + data.errorCode);
  })
});