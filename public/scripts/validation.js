(function(){
  var messages = [];

  var obj = {
    isValidForm: function(formData) {
      var valid = true;
      var regex = '';
      if (formData.email === "" || formData.gitUrl === "") {
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

      if (formData.gitUrl !== "") {
        regex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
        if(!regex.test(formData.gitUrl)) {
          messages.push("Invalid URL");
          valid = false;
        }
      }

      if (formData.subProject != undefined) {
        for (var i = 0; i < formData.subProject.length; i++) {
          regex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
          if (!(formData.subProject[i] == "")) {
            if(!regex.test(formData.subProject[i])) {
              messages.push("Invalid URL");
              valid = false;
            }
          }
        }
      }
      return valid;
    },

    getMessages: function () {
      return messages;
    },

    setMessages: function (val) {
      messages = val;
    },

    isGithubHTTPS: function (url) {
      regex = /^(http|https):\/\/github.com\/[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}\/[a-z\d-]{0,38}(\.git)?/
      return regex.test(url)
    },

    isValidHerokuAppName: function (name) {
      if (name === "") {
        messages.push("Empty Heroku App Name");
        return false;
      }
      return true;
    }
  };

  if ((typeof module) === 'undefined') {
    window.validation = obj;
  } else {
    module.exports = obj;
  }
})();
