(function(){
  var messages = [];
  var isValidUsername = false;
  var isValidReponame = false;
  var obj = {
    isValid: function(formData) {
      var valid = true;
      var regex = '';
      if (formData.email === "" || formData.username === "" || formData.reponame === "") {
        messages.push("Empty field(s)");
        valid = false;
      }

      if (formData.email !== "") {
        regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!regex.test(formData.email)) {
          messages.push("Invalid Email address");
          valid = false;
        }
      }
      return valid;
    },

    validateUsername: function (username) {
      if (username === "") {
        return false;
      }
      $.ajaxSetup({async: false});
      $.get('https://api.github.com/users/' + username, {
        headers: {"User-Agent": "Yaydoc"}
      }).success(function() {
        isValidUsername = true;
      });
      return isValidUsername;
    },

    validateReponame: function (username, reponame) {
      if (reponame === "" || username === "") {
        return false;
      }
      $.ajaxSetup({async: false});
      $.get('https://api.github.com/repos/' + username + '/' + reponame, {
        headers: {"User-Agent": "Yaydoc"}
      }).success(function() {
        isValidReponame = true;
      });
      return isValidReponame;
    },

    getMessages: function () {
      return messages;
    },

    setMessages: function (val) {
      messages = val;
    }

  };

  if ((typeof module) === 'undefined') {
    window.validation = obj;
  } else {
    module.exports = obj;
  }
})();

