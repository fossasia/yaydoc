## Branch Policy

The following branches are maintained:
 * **development**
	 All development goes on in this branch. To make a contribution,
	 make a pull request to _development_.
	 PRs to gh-pages must pass a build check and a unit-test check on Travis
 * **master**
   This contains shipped code. After significant features/bugfixes are accumulated on development, a version update is done and make released.
   
## Code practices

Please follow the best practice to make it easy for the reviewer as well as the contributor keeping the focus on the code quality more than on managing pull request ethics. 

 * Single commit per pull request
 * Reference the issue numbers in the commit message. Follow the pattern ``` Fixes #<issue number> <commit message>```
 * Follow uniform design practices. The design language must be consistent throughout the app.
 * The pull request will not get merged until and unless the commits are squashed. In case there are multiple commits on the PR, the commit author needs to squash them and not the maintainers cherrypicking and merging squashes.
 * If the PR is related to any front end change, please attach relevant screenshots/links in the pull request description.
 * The Issues and Pull Requests follow certain templates. Please refer to them at [ISSUE_TEMPLATE.md](https://raw.githubusercontent.com/fossasia/yaydoc/master/.github/ISSUE_TEMPLATE.md) and [PULL_REQUEST_TEMPLATE.md](https://raw.githubusercontent.com/fossasia/yaydoc/master/.github/PULL_REQUEST_TEMPLATE.md)