/**
 * Search for repositories
 */
var subProjectId = 0; // sub projects dynamic id
var repositorySelectIds = []; // array for storing repositories select element

var registerDisableChecker = function () {
  var flag = true; // flag to check whether any of the select is
  repositorySelectIds.forEach(function(x) {
    if ($(`#${x}`).val() === "") {
      flag = false;
    }
  })
  if (flag) {
    styles.enableButton("btnRegister");
  } else {
    styles.disableButton("btnRegister");
  }
}

var search = function (searchBarInput, searchResultDiv, tempSubProjectId) {
  var username = $("#orgs").val().split(":")[1];
  var repositorySelectId = "repositories";
  if (tempSubProjectId !== 0) {
    repositorySelectId = `repositories_${tempSubProjectId}`
  }
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
      var index = repositorySelectIds.indexOf(repositorySelectId);
      if (index > -1) {
        repositorySelectIds.splice(index,0)
      }
      registerDisableChecker();
    } else {
      styles.disableButton("btnRegister");
      repositorySelectIds.push(repositorySelectId);
      var select = '<label class="control-label" for="repositories">Repositories:</label>';
      if (tempSubProjectId === 0) {
        select += `<select class="form-control" id="${repositorySelectId}" name="repository" required>`;
      } else {
        select += `<select class="form-control" id="${repositorySelectId}" name="subRepositories" required>`;
      }

      select += `<option value="">Please select</option>`;
      result.items.forEach(function (x){
        select += `<option value="${x.full_name}">${x.full_name}</option>`;
      });
      select += '</select>';
      searchResultDiv.append(select);
      $(`#${repositorySelectId}`).change(function () {
        registerDisableChecker();
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

  /**
   * Register search events to the search bar
   * @param id: Count of the search bar
   */
  var registerSearchEvents = function (id) {
    var searchBar = '#search_bar';
    var searchResult = "#search_result";
    var searchBtn = "#search";
    if (id !== 0) {
      searchBar += `_${id}`;
      searchResult += `_${id}`;
      searchBtn += `_${id}`;
    }
    $(searchBar).on('keyup keypress', function(e) {
      var keyCode = e.keyCode || e.which;
      if (keyCode === 13) {
        search($(searchBar), $(searchResult), id);
      }
    });
    $(searchBtn).click(function (){
      search($(searchBar), $(searchResult), id);
    });
  }

  registerSearchEvents(0);

  $("#btnAddSub").click(function () {
    subProjectId += 1;
    styles.disableButton("btnRegister");
    $("#SubProject").append(`<div class="form-group" class="subProject_${subProjectId}">
                              <label for="search_bar" class="control-label">Sub Project ${subProjectId}:</label>
                              <div class="input-group">
                               <input id="search_bar_${subProjectId}" placeholder="Enter project name" class="form-control">
                               <span class="input-group-btn">
                                <button id="search_${subProjectId}" type="button" class="btn btn-default">Search</button>
                               </span>
                              </div>
                            </div>
                            <div id="search_result_${subProjectId}"></div>`);
    (function(tempSubProjectId){
      registerSearchEvents(tempSubProjectId);
    }(subProjectId));
  })
});
