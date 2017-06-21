$( document ).ready(function() {
 var insertedItem = [];
 $('#git_url').editableSelect();
 $('#git_url').keyup(() => {
   var q = $('#git_url').val()
   if (q.length > 3) {
     $.get(`https://api.github.com/search/repositories?q=${q}+fork%3Atrue`,
     (result) => {
       if (result.items != undefined) {
         for (var i = 0; i < result.items.length; i++) {
           if (insertedItem.indexOf(result.items[i].clone_url) < 0) {
             insertedItem.push(result.items[i].clone_url);
             $('#git_url').editableSelect('add', result.items[i].clone_url);
           }
         }
       }
     })
   } else if (q.length == 0) {
       $('#git_url').editableSelect('hide')
   }
 });
})
