function addDisable () {
  if (!$("#register_btn").hasClass("disabled")) {
    $("#register_btn").addClass("disabled");
  }
}
function search () {
  $("#search_result").empty();
  if ($("#search_bar").val() === "") {
    $("#search_result").append('<p class="text-center">Please enter the repository name<p>');
  } else {
    $("#search_result").append('<p class="text-center">Fetching data<p>');
    $.get(`https://api.github.com/search/repositories?q=user:${username}+fork:true+${$("#search_bar").val()}`,
    function (result) {
      $("#search_result").empty();
      if (result.total_count === 0) {
        $("#search_result").append(`<p class="text-center">No results found<p>`);
        addDisable();
      } else {
        $("#register_btn").removeClass("disabled");
        addDisable();
        var select = '<select class="form-control" id="repositories" name="repository" required>';
        select += `<option value="">Please select</option>`;
        result.items.forEach(function (x){
          select += `<option value="${x.name}">${x.name}</option>`;
        });
        select += '</select>';
        $("#search_result").append(select);
        $("#repositories").change(function () {
          if ($("#repositories").val() !== "") {
            $("#register_btn").removeClass("disabled");
          } else {
            addDisable();
          }
        });
      }
    });
  }
}
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
