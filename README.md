# Yaydoc
Development [![Build Status](https://travis-ci.org/fossasia/yaydoc.svg?branch=development)](https://travis-ci.org/fossasia/yaydoc)
Master [![Build Status](https://travis-ci.org/fossasia/yaydoc.svg?branch=master)](https://travis-ci.org/fossasia/yaydoc)
[![Join the chat at https://gitter.im/fossasia/yaydoc](https://badges.gitter.im/fossasia/yaydoc.svg)](https://gitter.im/fossasia/yaydoc?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Yaydoc is an automated documentation generation and deployment project that generates documentation for its registered repositories on each commit and deploys it to Github Pages.

## Communication
- Please join our mailing list to discuss questions regarding the project: https://groups.google.com/forum/#!forum/yaydoc
- Our chat channel is on Gitter here: [gitter.im/fossasia/yaydoc](http://gitter.im/fossasia/yaydoc)

## Deployments

* Master Branch can be tested on [yaydoc.herokuapp.com](https://yaydoc.herokuapp.com/)
* Development Branch is deployed [yaydoc-dev.herokuapp.com](https://yaydoc.herokuapp.com/)

## Getting started

### Prerequisites
To start using Yaydoc, make sure you have all of the following:
- [GitHub](https://github.com) login
- Project [hosted as a repository](https://help.github.com/categories/importing-your-projects-to-github/) on GitHub
- Project containing a directory (`source`) containing all the markup files

> __Note:__  For advanced configurations, include an `index.rst` file which contains 
[toctrees](http://www.sphinx-doc.org/en/stable/markup/toctree.html) to link the various documents.

### To get started with Yaydoc
1. Using your Github account, sign in to [yaydoc.org](http://yaydoc.org) and accept the Github 
[access permissions confirmation](docs/user_manual/github-oauth-scopes.md)
2. Once you’re signed in to Yaydoc, go to your dashboard and register the repository you want to build your 
documentation from.
3. Add a [.yaydoc.yml](docs/user_manual/yaydoc_configuration.md) file to the root of your repository to define rules and variables for Yaydoc's build process
4. Add the `.yaydoc.yml` file to git, commit and push, to trigger the Yaydoc build process.
5. Check the logs for your repository to see if the documentation generation and deployment process passes or fails.

### Installation

1. [Local Installation](docs/installation/docs.md)
2. [Heroku](docs/installation/heroku.md)
3. [GCE kubernetes](docs/installation/gce-kubernetes.md)
4. [Hetzner Cloud](docs/installation/hetzner-cloud.md)
 
> __Note:__ Yaydoc only runs builds on the commits you push after you’ve registered your repository in Yaydoc. Ensure 
that the repository is enabled from the its settings at Yaydoc.

## Known limitations
- If you use embedded html in markdown or reStructuredText, any static content such as images, javascript referred from it should be present in a `_static` directory placed under **source**.

## Deployment
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Contributions, Bug Reports, Feature Requests
This is an Open Source project and we would be happy to see contributors who report bugs and file feature requests 
submitting pull requests as well. Please report issues here https://github.com/fossasia/yaydoc/issues

## License
This project is currently licensed under the GNU General Public License v3. A copy of LICENSE.md should be present 
along with the source code. To obtain the software under a different license, please contact [FOSSASIA](http://blog.fossasia.org/contact/).
