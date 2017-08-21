$(function() {
  const predefinedMessages = {
    'mail_disabled_successful': "Mail service disabled for this repository",
    'mail_enabled_successful': "Mail service enabled for this repository",
    'mail_changed_successful': "Email address associated with this repository changed successfully",
    'pr_enabled_successful': "PR status enabled for this repository",
    'pr_disabled_successful': "PR status disabled for this repository"
  };

  if ((predefinedMessages[styles.getParameterByName("status")] || '') !== '') {
    styles.showNotification(predefinedMessages[styles.getParameterByName("status")]);
    window.history.pushState("", "", location.pathname);
  }

  $('.open-delete-modal').click(function () {
    $('#repository-name').val('');
    styles.disableButton("btnDelete");
    setTimeout(function(){
      $('#repository-name').focus();
    },500);
    $(".modal-body #name-code").html($(this).data('name'));
  });

  $('#repository-name').keyup(function () {
    var reponame = $('.modal-body #name-code').html();
    var name = $('#repository-name').val();

    if (name === reponame) {
      styles.enableButton("btnDelete");
    } else {
      styles.disableButton("btnDelete");
    }

  });

  $('.open-disable-modal').click(function () {
    $("#disableInput").val($(this).data('name'));
    $("#disableBtnYes").click(function () {
      $("#disableForm").submit();
    });
    $("#disableBtnClose").click(function () {
      $("#disableModal").modal('hide');
    });
  });

  registerSearchEvents(0);

  $("#register_btn").click(function () {
    if (!$("#register_btn").hasClass("disabled")) {
      $('#ci_register').submit();
    }
  });

  $('#ci_sub_register').on('keyup keypress', function(e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode === 13) {
      e.preventDefault();
      return false;
    }
  });

  /**
   * Toggle mail services for the repository
   */
  $('#mail-service').change(function() {
    var data = {repository: $(this).data('repository')};
    $.ajax({
      type: 'POST',
      url: $(this).prop('checked') ? '/repository/mail/enable' : '/repository/mail/disable',
      data: JSON.stringify(data),
      contentType: 'application/json',
      beforeSend: function () {
        styles.loadingChanges('mail-service');
      },
      success: function () {
        styles.successfulChanges('mail-service');
      },
      error: function () {
        styles.failedChanges('mail-service');
      }
    });
  });

  /**
   * Toggle receiving build status on each PR to the repository
   */
  $('#pr-status').change(function() {
    var data = {repository: $(this).data('repository')};
    $.ajax({
      type: 'POST',
      url: $(this).prop('checked') ? '/repository/prstatus/enable' : '/repository/prstatus/disable',
      data: JSON.stringify(data),
      contentType: 'application/json',
      beforeSend: function () {
        styles.loadingChanges('pr-status');
      },
      success: function () {
        styles.successfulChanges('pr-status');
      },
      error: function () {
        styles.failedChanges('pr-status');
      }
    });
  });

  /**
   * Toggle builds on each commit to the repository
   */
  $('#repository-status').change(function() {
    var data = {repository: $(this).data('repository')};
    $.ajax({
      type: 'POST',
      url: $(this).prop('checked') ? '/repository/enable' : '/repository/disable',
      data: JSON.stringify(data),
      contentType: 'application/json',
      beforeSend: function () {
        styles.loadingChanges('repository-status');
      },
      success: function () {
        styles.successfulChanges('repository-status');
      },
      error: function () {
        styles.failedChanges('repository-status');
      }
    });
  });

});
