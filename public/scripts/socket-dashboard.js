/**
 * Search for repositories
 */
var search = function () {
  var username = $("#orgs").val();
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
    'registration_failed': "Failed to register repository to Yaydoc!"
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
});
