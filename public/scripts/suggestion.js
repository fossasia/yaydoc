var insertedItem = [];
$( document ).ready(function() {
  addSuggestion('#git_url')
})

function addSuggestion(selector) {
  $(selector).editableSelect();
  insertedItem.forEach((x) => {
    $(selector).editableSelect('add', x);
  })
  $(selector).keyup(() => {
    console.log(`hi iam ${selector}`);
    var q = $(selector).val()
    if (q.length > 3) {
      $.get(`https://api.github.com/search/repositories?q=${q}+fork%3Atrue`,
      (result) => {
        if (result.items != undefined) {
          for (var i = 0; i < result.items.length; i++) {
            if (insertedItem.indexOf(result.items[i].clone_url) < 0) {
              insertedItem.push(result.items[i].clone_url);
              $(selector).editableSelect('add', result.items[i].clone_url);
            }
          }
        }
      })
    } else if (q.length == 0) {
        $(selector).editableSelect('hselectore')
    }
  });
}
