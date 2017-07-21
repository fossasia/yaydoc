/**
 * Validation of form input values
 */
(function(){
  var messages = [];

  var obj = {
    /**
     * Check input form at `/index` for valud inputs
     * @param formData: Object containing form input as value
     * @returns {boolean}: true for valid form values
     */
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

      if (formData.subProject !== undefined) {
        for (var i = 0; i < formData.subProject.length; i++) {
          regex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
          if (!(formData.subProject[i] === "")) {
            if(!regex.test(formData.subProject[i])) {
              messages.push("Invalid URL");
              valid = false;
            }
          }
        }
      }
      return valid;
    },

    /**
     * Retrieve messages to display in notification
     * @returns {Array}: messages
     */
    getMessages: function () {
      return messages;
    },

    /**
     * Set values to notification messages
     * @param val: messages
     */
    setMessages: function (val) {
      messages = val;
    },

    /**
     * Check if the inputted URL is a valid Github Repository or not
     * @param url: URL of the Github Repository
     * @returns {boolean}: true if the inputted value if value
     */
    isGithubHTTPS: function (url) {
      const regex = /^(http|https):\/\/(www.|)github.com\/[A-Za-z\d](?:[A-Za-z\d]|-(?=[A-Za-z\d])){0,38}\/[A-Za-z\d-]{0,38}(\.git)?/;
      return regex.test(url)
    },

    /**
     * Check if the inputted value is a valid Heroku app name or not
     * @param name: Heroku App Name
     * @returns {string}:
     *                  - invalid: Invalid Heroku App Name
     *                  - existent: Existing Heroku App Name
     *                  - valid: Valid Heroku App Name
     */
    validateHerokuAppName: function (name) {
      styles.invalidInput('herokuAppName');

      if (name === "") {
        messages.push("Empty Heroku App Name");
        return "invalid";
      }

      if (name.length < 3) {
        messages.push("Heroku app name must be of length greater than or equal to 3");
        return "invalid";
      }

      if (name.search(/^[a-z0-9-]+$/) === -1) {
        messages.push("Heroku app name must be of length greater than or equal to 3");
        return "invalid";
      }

      $.ajax({
        url: 'https://api.heroku.com/apps/' + name,
        headers: {
          Accept: "application/vnd.heroku+json; version=3"
        }
      }).complete(function (xhr) {
        if (xhr.status === 200) {
          messages.push("Heroku application with the inputted name already exist. If you are not the owner, you cannot deploy!");
          styles.warningInput('herokuAppName');
          return "existent";
        } else if (xhr.status === 404) {
          styles.validInput('herokuAppName');
          return "valid";
        } else {
          messages.push("Invalid heroku app name.");
          return "invalid";
        }
      });
    }
  };

  if ((typeof module) === 'undefined') {
    window.validation = obj;
  } else {
    module.exports = obj;
  }
})();
