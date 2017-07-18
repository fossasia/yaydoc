# Yaydoc
[![Build Status](https://travis-ci.org/fossasia/yaydoc.svg?branch=master)](https://travis-ci.org/fossasia/yaydoc)
[![Join the chat at https://gitter.im/fossasia/yaydoc](https://badges.gitter.im/fossasia/yaydoc.svg)](https://gitter.im/fossasia/yaydoc?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> Docs! Yay!

## Deployment
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Prerequisites
- Create a directory in your repository containing all the markup files along with an `index.rst` file which contains [toctrees](http://www.sphinx-doc.org/en/stable/markup/toctree.html) to link the various documents.
- Register your repository with [Yaydoc CI](https://yaydoc.herokuapp.com).

## Usage

Yaydoc will automatically read configuration from a file named *.yaydoc.yml* stored at the root of your repository.

- Specifying Metadata

```yaml
metadata:
  author: FOSSASIA       # Author of the project, default: Github uername or organization
  projectname: Yaydoc    # Name of the Project, default: Name of the repository
  version: development   # Version of the Project, default: UTC date of latest deployment
  debug: true            # Enables detailed logging, default: false
  subproject:            # Other projects which should be included when building the documentation
    - url: <URL of Subproject 1>       # URL of the repository
      docpath: doc                     # Path of the documentation of the subproject, default: docs
    - url: <URL of subproject 2>
```

- Configuring build options

```yaml
build:
  doctheme: sphinx_fossasia_theme      # Name of the theme. Apart from built in sphinx themes, custom themes from PyPI are also supported, default: sphinx_fossasia_theme   
  docpath: docs                        # Path of the documentation, default: docs
  logo: images/logo.svg                # Path to an image to be used as logo for the Project. It should be relative to `docpath`.
  markdown_flavour: markdown_github    # Markdown format flavour. should be one of `markdown`, `markdown_strict`, `markdown_phpextra`, `markdown_github`, `markdown_mmd`, `commonmark`, default: markdown_github
  autoapi:               # If enabled, Yaydoc will crawl your repository and try to extract API documentation
    - language: python   # Language for which API docs should be generated.
      path: modules      # If specified, only the `path` would be crawled to extract APIs
    - language: java
```
- Javadoc configuration

```yaml
javadoc:
  path: 'src/'
```

- Configuring publishers

```yaml
publish:
  ghpages:
    docurl: yaydoc.fossasia.org    # Custom URL at which the site should be published, default: <username>.github.io/<reponame>
  heroku:
    app_name: yaydoc               # Name of the heroku app. Your docs would be deployed at <app_name>.herokuapp.com
```

- Configuring API Docs

```yaml
apidocs:
  name: swagger                               # Supported api-docs [ swagger(https://swagger.io/) ]
  url:  http://api.susi.ai/docs/swagger.json  # URL to the JSON specification
  ui: swagger                                 # Supported UI [ swagger(https://swagger.io/swagger-ui/) ]
```

Currently Yaydoc only supports publishing to ghpages and heroku.

## Accessing the Yaydoc CI
![step 1](docs/screenshots/ci-step-1.png)

 - Click the `CI Deploy` button

![step 2](docs/screenshots/ci-step-2.png)

 - Select the repository in which you want to integrate Yaydoc CI

![step 3](docs/screenshots/ci-step-3.png)

- After successful registration Yaydoc will push the documentation to gh-pages on every commit the user makes.

- Sphinx's alabaster theme will be used for documentation

- You can see the generated documentation at `https://<username>.github.io/<project name>`
