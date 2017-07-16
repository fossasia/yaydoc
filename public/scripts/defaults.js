(function(){
  /**
   * Setting default values for various form input
   */
  window.defaults = {
    /**
     * Returns the default value for the root directory of documentation
     * @returns {string}
     */
    getDefaultDocPath: function () {
      return 'docs';
    },

    /**
     * Setting the branch name with the `default_branch` attribute from
     * Github's Repository Components API
     * @param gitUrl: URL of the git repository
     */
    setDefaultBranchName: function (gitUrl) {
      var owner = gitUrl.split("/")[3] || '';
      var repository = (gitUrl.split("/")[4] || '').split(".")[0] || '';
      $.get('https://api.github.com/repos/' + owner + '/' + repository, {
        headers: {"User-Agent": "Yaydoc"}
      }).complete(function(data) {
        $("#target_branch").val(data.responseJSON.default_branch);
      });
    }
  };
})();
