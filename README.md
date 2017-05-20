# yaydoc
[![Build Status](https://travis-ci.org/fossasia/yaydoc.svg?branch=master)](https://travis-ci.org/fossasia/yaydoc)
[![Join the chat at https://gitter.im/fossasia/yaydoc](https://badges.gitter.im/fossasia/yaydoc.svg)](https://gitter.im/fossasia/yaydoc?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> Docs! Yay!

### Prerequisites
- Create a directory in your repository containing all the markup files along with an `index.rst` file which contains [toctrees](http://www.sphinx-doc.org/en/stable/markup/toctree.html) to link the various documents.
- Create a `gh-pages` branch in your repository.
- Register your repository with [Travis CI](https://www.google.co.in/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=0ahUKEwjn8Y3v1_zTAhUKtI8KHaJWBssQFgg6MAA&url=https%3A%2F%2Ftravis-ci.org%2F&usg=AFQjCNFI_4340tr1MDD78A2HC-luYCxgAQ&sig2=d-UEeLAfCHrO-7wo9qYSGg).

## Usage
- Generate `Github Personal Token` by following this [Guide](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/)
- Set the following Environment Variables in Travis CI. [Guide](https://docs.travis-ci.com/user/environment-variables/#Defining-Variables-in-Repository-Settings)     

| Environment Variable | Description                                       | Default / FORMAT  |
|:--------------------:| ------------------------------------------------- |:-----------------:|
| AUTHOR               | Author of the repository.                         | NONE * |
| DOCPATH              | Path of the documentation.                        | NONE * (eg. `docs/`) |
| DOCTHEME             | Name of the theme.                                | alabaster ([built-in themes](http://www.sphinx-doc.org/en/stable/theming.html#builtin-themes)) | 
| DOCURL               | Custom URL at which the site should be published. | <i>\<username or organization>.github.io/\<reponame></i> ([Reference](https://help.github.com/articles/using-a-custom-domain-with-github-pages/)) |
| GITURL               | HTTPS URL of the repository (Not SSH).            | https://\<username>:\<token>@github.com/\<organisation or username>/<repname> * |
| PROJECTNAME          | Name of the Project.                              | NONE * |
| VERSION              | Version of the Project.                           | NONE * |

```
   * : The following environment variables must be specified for yaydoc to work. 
```

## Travis Configuration
Add the following content to the `.travis.yml` file in the root directory of your repository.

**If the primary language is Python**
```yml
script:
- wget https://raw.githubusercontent.com/fossasia/yaydoc/master/generate.sh
- chmod +x ./generate.sh
- ./generate.sh
```

**For Languages other than Python**

```yml
script:
- pip install --user virtualenv
- wget https://raw.githubusercontent.com/fossasia/yaydoc/master/generate.sh
- chmod +x ./generate.sh
- ./generate.sh