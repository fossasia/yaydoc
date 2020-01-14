# Specifying Yaydoc Configurations
In order to generate and deploy documentation for a registered repository, Yaydoc reads configurations from a YAML file. 
To get started with Yaydoc the first step is to create a file named `.yaydoc.yml` and specify the required options.The 
configuration file is divided into four sections. 

## metadata
Following is a description of config options under the `metadata` section and it's example usage.

<!-- markdown+ -->
| Key | Description | Default |
|-----|-------------|---------|
| author      | The author of the repository. It is used to construct the copyright text.                | user/organization |
| projectname | The name of the project. This would be displayed on the generated documentation.         | Name of the repository |
| version     |	The version of the project. This would be displayed alongside the project name           | Current UTC date |
| debug       | If true, the logs generated would be a little more verbose. Can be one of true or false. | true |
| inline_math | Whether inline math should be enabled. This only affects markdown documents.             | false |
| autoindex   | This section contains various settings to control the behavior of the auto generated index. Use this to customize the starting page while having the benefit of not having to specify a manual index. | _none_ |
<!-- endmarkdown+ -->

```yaml
metadata:
  author: FOSSASIA
  projectname: Yaydoc
  version: development
  debug: true
  inline_math: true
  autoindex:
    include:
    - README.md
    toc:
      show: true
      heading: Contents
    subproject:
      show: true
      heading: Sub projects
    apidoc:
      show: true
      heading: API Documentation
      javadoc:
        show: true
      swagger:
        show: true
    rss:
      heading: RSS
      url: <rss_url>
    twitter:
      heading: Tweets
      query: fossasia
```

## build
Following is a description of config options under the `build` section and it's example usage.

<!-- markdown+ -->
| Key | Description | Default |
|-----|-------------|---------|
| theme            | The theme which should be used to build the documentation. The attribute name can be one of the builtin themes or any custom sphinx theme from PyPI. Note that for PyPI themes, you need to specify the distribution name and not the package name. It also provides an attribute options to control specific theme options. | sphinx_fossasia_theme |
| source           | This is the path which would be scanned for markdown and reST files. Also any static content such as images referenced from embedded html in markdown should be placed under a _static directory inside source. Note that the README would always be included in the starting page irrespective of source from the auto-generated index | docs/ |
| logo             | The path to an image to be used as logo for the project. The path specified should be relative to the source directory. | _none_ |
| markdown_flavour | The markdown flavour which should be used to parse the markdown documents. Possible values for this are markdown, markdown_strict, markdown_phpextra, markdown_github, markdown_mmd and commonmark. Note that currently this option is only used for parsing any included documents using the mdinclude directive and it's unlikely to change soon. | markdown_github |
| mock             | Any python modules or packages which should be mocked. This only makes sense if the project is in python and uses autodoc has C dependencies. | _none_ |
| autoapi          | If enabled, Yaydoc will crawl your repository and try to extract API documentation. Provides attributes for specifying the language and source path. Currently supported languages are java and python | _none_ |
| subproject       | This section can be used to include other repositories when building the docs for the current repositories. The source attribute should be set accordingly. | _none_ |
| github_button    | This section can be used to include various Github buttons such as fork, watch, star, etc. | hidden |
| github_ribbon    | This section can be used to include a Github ribbon linking to your github repo. | hidden |
<!-- endmarkdown+ -->

```yaml
build:
  theme: 
    name: sphinx_fossasia_theme
  source: docs
  logo: images/logo.svg
  markdown_flavour: markdown_github
  mock:
    - numpy
    - scipy
  autoapi:
    - language: python
      source: modules
    - language: java
  subproject:
    - url: <URL of Subproject 1>
      source: doc
    - url: <URL of subproject 2>
  github_ribbon:
    position: right
    color: green
  github_button:
    buttons:
      watch: true
      star: true
      issues: true
      fork: true
      follow: true
    show_count: true
    large: true
```

## publish
Following is a description of config options under the `publish` section and it's example usage.

<!-- markdown+ -->
| Key | Description | Default |
|-----|-------------|---------|
| ghpages | It provides a attribute url whose value is written in a CNAME file while publishing to github pages. | _none_ |
| heroku  | It provides an app_name attribute which is used as the name of the heroku app. Your docs would be deployed at `<app_name>.herokuapp.com` | _none_ |
<!-- endmarkdown+ -->

```yaml
publish:
  ghpages:
    url: docs.yaydoc.org
  heroku:
    app_name: yaydoc 
```

## extras
Following is a description of config options under the `extras` section and it's example usage.

<!-- markdown+ -->
| Key | Description | Default |
|-----|-------------|---------|
| swagger | This can be used to include swagger API documentation in the build. The attribute url should point to a valid swagger json file. It also accepts an additional parameter ui which for now only supports swagger. | _none_ |
| javadoc | It takes an attribute path and can include javadocs from the repository. | _none_ |
<!-- endmarkdown+ -->

```yaml
extras:
  swagger:
    url: http://api.susi.ai/docs/swagger.json
    ui: swagger
  javadoc:
    path: 'src/' 
```
