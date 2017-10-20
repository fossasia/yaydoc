# Yaydoc's use of GitHub API Scopes
When you sign in to Yaydoc for the first time, we ask for permissions to access some of your data on GitHub. Read
the [GitHub API Scope Documentation](https://developer.github.com/v3/oauth/#scopes) for general information about this,
or pick an explanation of what data we need and why we need it.

## Permissions
At Yaydoc we ask for the following permissions:
* `public_repo`: Grants read and write access to code, commit statuses, collaborators, and deployment statuses for
public repositories and organizations.
* `read:org`: When you’re logged in on Yaydoc, we show you all of your registered repositories, including the ones from
any organization you’re part of. The GitHub API hides any organizations you’re a private member of without this scope.
So to make sure we show you all of your repositories, we require this scope. Note that this scope allows access to the
basic information about both private and public repositories, but not on any of the data or code stored in them.
* `write:repo_hook`: Building documentation for a new repository using Yaydoc is as easy as registering it in from your
dashboard and pushing a new commit. Updating the webhook required for us to be notified from GitHub on new commits or
pull requests requires this API scope. Additionally, your user needs to have admin access to the repository you want
to enable.
