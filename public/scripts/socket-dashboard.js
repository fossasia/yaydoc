

$(function() {
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

  registerSearchEvents(0);

  $("#btnAddSub").click(function () {
    subProjectId += 1;
    styles.disableButton("btnRegister");
    $("#SubProject").append(`<div class="form-group subProject_${subProjectId}">
                              <label for="search_bar" class="control-label">Sub Project:</label>
                              <div class="input-group">
                               <input id="search_bar_${subProjectId}" placeholder="Enter project name" class="form-control">
                               <span class="input-group-btn">
                                <button id="search_${subProjectId}" type="button" class="btn btn-default">Search</button>
                               </span>
                               <span class="input-group-btn">
                                 <button type="button" class="btn btn-default subRemove_${subProjectId}">
                                  <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                 </button>
                               </span>
                              </div>
                            </div>
                            <div id="search_result_${subProjectId}"></div>`);
    (function(tempSubProjectId){
      registerSearchEvents(tempSubProjectId);
      $(`.subRemove_${tempSubProjectId}`).click(function () {
        $(`.subProject_${tempSubProjectId}`).remove();
        $(`#search_result_${tempSubProjectId}`).remove();
      });
    }(subProjectId));
  })
});
