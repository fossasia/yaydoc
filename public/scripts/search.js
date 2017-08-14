/**
 * Search for repositories
 */
var subProjectId = 0; // sub projects dynamic id
var repositorySelectIds = []; // array for storing repositories select element

/**
 * Disable register button if any of the select has empty string
 */
var registerDisableChecker = function () {
  var flag = true; // flag to check whether any of the select has empty string
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

/**
 * Search user repositories
 * @param searchBarInput: Search bar selector
 * @param searchResultDiv: Selector to append the searched results
 * @param tempSubProjectId: Temporary id of the sub project
 */
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
