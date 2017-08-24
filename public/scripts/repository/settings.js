$(function() {
  const predefinedMessages = {
    'remove_branch_failed': "Failed to remove the branch!",
    'remove_branch_success': "Branch removed successfully",
    'update_branch_failed': "Failed to update branches",
    'update_branch_success': "Branches updated successfully",
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

  $('.open-branch-modal').click(function () {
    var repository = $(this).data('repository');
    $.ajax({
      type: 'GET',
      url: '/repository/' + repository + '/branches',
      success: function(data) {
        $("#branch-load").css("display", "none");
        var repositoryList =
          '<div class="form-group">' +
          '<label class="control-label" for="branches">Branches: </label>' +
          '<select class="form-control selectpicker" id="branches" name="branches" multiple data-size="3">';
        var options = '';
        for (var branch of data.branches) {
          if (branch !== 'gh-pages') {
            options += '<option>' + branch + '</option>';
          }
        }
        repositoryList += options;
        repositoryList += '</select></div>';
        repositoryList += '<p><strong>Note:</strong> Specifying one or more branches would limit the trigger of ' +
          'the documentation generation process to changes in these branches</p>';
        $("#branch-modal").empty().append(repositoryList);
        $('.selectpicker').selectpicker("render");
        $('.selectpicker').selectpicker("val", data.registeredBranches);
        $('#btnAddBranches').removeAttr("disabled");
      },
      error: function(data) {
        $("#branch-load").css("display", "none");
        $("#branch-modal").append('<p>Failed to retrieve branches</p><p>' + data + '</p>');
      }
    });
  });
});
