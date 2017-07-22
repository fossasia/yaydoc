/**
 * Disable the register button
 */
var addDisable = function () {
  if (!$("#register_btn").hasClass("disabled")) {
    $("#register_btn").addClass("disabled");
  }
};

/**
 * Search for repositories
 */
var search = function () {
  const username = $("#orgs").val();
  const searchBarInput = $("#search_bar");
  const searchResultDiv = $("#search_result");
  const registerButton = $("#register_btn");
  const repositorySelect = $("#repositories");

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
      addDisable();
    } else {
      registerButton.removeClass("disabled");
      addDisable();
      var select = '<label class="control-label" for="repositories">Repositories:</label>';
      select += '<select class="form-control" id="repositories" name="repository" required>';
      select += `<option value="">Please select</option>`;
      result.items.forEach(function (x){
        select += `<option value="${x.full_name}">${x.full_name}</option>`;
      });
      select += '</select>';
      searchResultDiv.append(select);
      $("#repositories").change(function () {
        if (repositorySelect.val() !== "") {
          registerButton.removeClass("disabled");
        } else {
          addDisable();
        }
      });
    }
  });
};

$(function() {
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
