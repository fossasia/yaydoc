/**
 * Client-side Event Handling for index
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
      $("#subProject").attr("disabled", "none");
    } else {
      styles.showNotification(validation.getMessages());
      validation.setMessages([]);
    }
  });

  /**
   * Add subprojects in the form
   */
  var tempSubProjectId = 1;
  $("#btnSubProject").click(function () {
    $("#subproject").append(`<select id="subproject_${tempSubProjectId}" placeholder="Enter URL for Sub Project" name="subproject_url[]" class="form-control subproject" type="text"></select>`)
    addSuggestion(`#subproject_${tempSubProjectId}`);
    tempSubProjectId += 1;
  });

  /**
   * View/Hide Inputs for Advanced Configurations
   */
  $("#advanced").change(function () {
    if (this.checked) {
      $("#configs").css({"opacity": "1", "visibility": "visible", "height": "auto"});
    } else {
      $("#configs").css({"opacity": "0", "visibility": "hidden", "height": "0"});
    }
  });

  /**
   * Toggle editing of Branch Name input
   */
  $("#btnEditBranch").click(function () {
    styles.toggleEditing("target_branch");
    if ($("#target_branch").attr("disabled")) {
      $("#target_branch").val('');
    } else {
      defaults.setDefaultBranchName($("#git_url").val());
    }
  });

  /**
   * Toggle editing of Docpath input
   */
  $("#btnEditPath").click(function () {
    styles.toggleEditing("doc_path");
    if ($("#doc_path").attr("disabled")) {
      $("#doc_path").val('');
    } else {
      $("#doc_path").val(defaults.getDefaultDocPath());
    }
  });

  /**
   * Retrieving standard logs from documentation generation
   */
  socket.on('logs', function (data) {
    $('#messages').append($('<li class="info-logs">').text(data.data));
    $("#progress").css("width", data.donePercent + "%");
  });

  /**
   * Retrieving erroneous logs from documentation generation
   */
  socket.on('err-logs', function (msg) {
    $('#messages').append($('<li class="danger-logs">').text(msg));
  });

  /**
   * Displaying links to further actions on successful generation
   */
  socket.on('success', function (data) {
    $("#progress").css("width", "100%");
    $('#btnDownload').css("display", "inline").attr("href", "/download/" + data.email +"/" + data.uniqueId);
    $('#btnPreview').css("display", "inline").attr("href", "/preview/" + data.email +"/" + data.uniqueId + "_preview");
    styles.showNotification("Documentation Generated Successfully");
    if (validation.isGithubHTTPS(data.gitUrl)) {
      $('#btnDeployGithub').css("display", "inline");
      $('#onetimeDeploy').attr("href", '/auth/github?email='+data.email+'&uniqueId='+data.uniqueId+'&gitURL='+data.gitUrl);
    }
    $('#btnDeployHeroku').css("display", "inline").attr("href", '/auth/heroku?email='+data.email+'&uniqueId='+data.uniqueId);

    $('#btnLogs').css("display", "inline");
    $("#btnLogs").click(function () {
      socket.emit('retrieve-generate-logs', {email: data.email, uniqueId: data.uniqueId});
      $('#downloadDetailedLogs').attr('href', '/logs/generate/' + data.email + '/' + data.uniqueId);
    });

  });

  /**
   * Actions performed on a failure in documentation generation
   * - Display process failure notification
   * - Retrieve detailed logs from the backend
   */
  socket.on('failure', function (data) {
    styles.showNotification("Failed to Generate Documentation: Error " + data.code);

    $('#btnLogs').css("display", "inline");
    $("#btnLogs").click(function () {
      socket.emit('retrieve-generate-logs', {email: data.email, uniqueId: data.uniqueId});
      $('#downloadDetailedLogs').attr('href', '/logs/generate' + data.email + '/' + data.uniqueId);
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

/**
 * Retrieve data from input form fields
 * @returns {{}}: From Data as an object
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
    if (field.name === "subproject_url[]") {
      if (data.subProject === undefined) {
        data.subProject = [field.value];
      } else {
        data.subProject.push(field.value);
      }
    }
    if (field.name === "target_branch") { data.targetBranch = field.value.trim(); }
    if (field.name === "doc_path") { data.docPath = field.value.trim(); }
  });

  return data;
}
