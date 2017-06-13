# yaydoc
[![Build Status](https://travis-ci.org/fossasia/yaydoc.svg?branch=master)](https://travis-ci.org/fossasia/yaydoc)
[![Join the chat at https://gitter.im/fossasia/yaydoc](https://badges.gitter.im/fossasia/yaydoc.svg)](https://gitter.im/fossasia/yaydoc?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> Docs! Yay!

## Prerequisites
- Create a directory in your repository containing all the markup files along with an `index.rst` file which contains [toctrees](http://www.sphinx-doc.org/en/stable/markup/toctree.html) to link the various documents.
- Register your repository with [Travis CI](https://travis-ci.org).

## Usage

**With environment variables**

Set the following Environment Variables in Travis CI. [Guide](https://docs.travis-ci.com/user/environment-variables/#Defining-Variables-in-Repository-Settings)     

| Environment Variable | Description                                       | Default / FORMAT  |
|----------------------| ------------------------------------------------- |-------------------|
| AUTHOR               | Author of the repository.                         | Github username or organization |
| DOCPATH              | Path of the documentation.                        | NONE * (eg. `docs/`) |
| DOCTHEME             | Name of the theme.                                | alabaster ([built-in themes](http://www.sphinx-doc.org/en/stable/theming.html#builtin-themes)) / <i>(Custom themes available in PyPi are also supported)</i>| 
| DOCURL               | Custom URL at which the site should be published. | <i>\<username or organization>.github.io/\<reponame></i> ([Reference](https://help.github.com/articles/using-a-custom-domain-with-github-pages/)) |
| PROJECTNAME          | Name of the Project.                              | Name of the repository |
| VERSION              | Version of the Project.                           | development |
| LOGO                 | An image to be used as logo for the Project.      | path relative to DOCPATH. *example* - <i>To use DOCPATH/images/logo.svg as the logo, set LOGO as images/logo.svg</i>.|
| MARKDOWN_FLAVOUR     | Input file format flavour. The supported flavors are  `markdown`, `markdown_strict`, `markdown_phpextra`, `markdown_github`, `markdown_mmd`, `commonmark`| markdown_github   |
| OAUTH_TOKEN          | Github Personal Token. generate it by following this [Guide](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/)  | NONE *(Not required If using ssh) |
| PYTHON_PACKAGE       | Path to any python package for which API docs should be generated. Provide a `requirements.txt` at the root containing all dependencies. | NONE |

```
   * : The following environment variables must be specified for yaydoc to work. 
```

**With a configuration file**

You could also use a configuration file instead of setting up environment variables.
Yaydoc automatically reads from a file named *.yaydoc.yml* if present in the root of the repository.

- Specifying Metadata

```yaml
metadata:
  author: FOSSSIA
  projectname: Yaydoc
  version: development
```

- Configuring build options

```yaml
build:
  doctheme: fossasia
  docpath: docs/
  logo: images/logo.svg
  markdown_flavour: markdown_github
```

- Configuring publishers

```yaml
publish:
  ghpages:
    docurl: yaydoc.fossasia.org
```

Currently Yaydoc only supports publishing to ghpages. More publishers to be added soon.

## Travis Configuration
Add the following content to the `.travis.yml` file in the root directory of your repository.

**If the primary language is Python**
```yaml
script:
- wget https://raw.githubusercontent.com/fossasia/yaydoc/master/generate_ci.sh
- chmod +x ./generate.sh
- ./generate.sh
```

**For Languages other than Python**

```yaml
script:
- pip install --user virtualenv
- wget https://raw.githubusercontent.com/fossasia/yaydoc/master/generate_ci.sh
- chmod +x ./generate.sh
- ./generate.sh
```

## Using SSH
Additionally If you have ssh setup on your repository, yaydoc prioritizes it over Github Personal token. To setup ssh follow these steps. 

- Generate a new ssh key following this [Guide](https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/#generating-a-new-ssh-key)
- Encrypt the generated keys by following this [Guide](https://docs.travis-ci.com/user/encrypting-files/#Automated-Encryption)
- Add public key to github by following this [Guide](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/)
- Add the following to your `.travis.yml` making appropriate changes where necessary

```yaml
before_deploy:
- openssl aes-256-cbc -K $encrypted_cab6203e105e_key -iv $encrypted_cab6203e105e_iv -in .utility/yaydoc_deploy.enc -out .utility/yaydoc_deploy -d
- eval "$(ssh-agent -s)"
- chmod 600 .utility/yaydoc_deploy
- ssh-add .utility/yaydoc_deploy
```
