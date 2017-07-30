/**
 * Search for repositories
 */
var search = function () {
  var username = $("#orgs").val().split(":")[1];
  const searchBarInput = $("#search_bar");
  const searchResultDiv = $("#search_result");

  searchResultDiv.empty();
  if (searchBarInput.val() === "") {
    searchResultDiv.append('<p class="text-center">Please enter the repository name<p>');
    return;
  }

  searchResultDiv.append('<p class="text-center">Fetching data<p>');

  $.get(`https://api.github.com/search/repositories?q=user:${username}+fork:true+${searchBarInput.val()}`, function (result) {
    searchResultDiv.empty();
    if (result.total_count === 0) {
      searchResultDiv.append(`<p class="text-center">No results found<p>`);
      styles.disableButton("btnRegister");
    } else {
      styles.disableButton("btnRegister");
      var select = '<label class="control-label" for="repositories">Repositories:</label>';
      select += '<select class="form-control" id="repositories" name="repository" required>';
      select += `<option value="">Please select</option>`;
      result.items.forEach(function (x){
        select += `<option value="${x.full_name}">${x.full_name}</option>`;
      });
      select += '</select>';
      searchResultDiv.append(select);
      $("#repositories").change(function () {
        if ($("#repositories").val() !== "") {
          styles.enableButton("btnRegister");
        } else {
          styles.disableButton("btnRegister");
        }
      });
    }
  });
};

$(function() {
  const predefinedMessages = {
    'registration_successful': "Registration successful! Hereafter Documentation will be pushed to the GitHub pages on each commit.",
    'registration_already': "This repository has already been registered.",
    'registration_failed': "Failed to register repository to Yaydoc!",
    'registration_unauthorized': "You do not have admin permission for this repository.",
    'registration_mismatch': "A hook for Yaydoc is created but the repository is not registered!",
    'delete_success': "Repository removed from Yaydoc successfully",
    'delete_failure': "Failed to remove repository!",
    'enabled_successful': "Yaydoc enabled successfully for this repository",
    'disabled_successful': "Yaydoc disabled successfully for this repository"
  };

  if ((predefinedMessages[styles.getParameterByName("status")] || '') !== '') {
    styles.showNotification(predefinedMessages[styles.getParameterByName("status")]);
    window.history.pushState("", "", location.pathname);
  }

  $("#search").click(function () {
    search();
  });

  $('#search_bar').on('keyup keypress', function(e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode === 13) {
      search();
    }
  });

  $("#register_btn").click(function () {
    if (!$("#register_btn").hasClass("disabled")) {
      $('#ci_register').submit();
    }
  });

  $('#ci_register').on('keyup keypress', function(e) {
    var keyCode = e.keyCode || e.which;
    if (keyCode === 13) {
      e.preventDefault();
      return false;
    }
  });

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
});
