# yaydoc
[![Build Status](https://travis-ci.org/fossasia/yaydoc.svg?branch=master)](https://travis-ci.org/fossasia/yaydoc)
[![Join the chat at https://gitter.im/fossasia/yaydoc](https://badges.gitter.im/fossasia/yaydoc.svg)](https://gitter.im/fossasia/yaydoc?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> Docs! Yay!
# Usage
- generate github personal token by following this guide (https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/)
- set the following environment variable in the travis       
     1) AUTHOR      (author of the repository)
     2) DOCPATH     (path of the documentation)
     3) GITURL      (https url not ssh)
     4) PROJECTNAME (project name)
     5) VERSION     (version of project)
     6) DOCURL      (custom url at which site should be published.
                     If it is not set then default gh-pages url is used which is of the format
                     <username or organization>.github.io/<reponame>)
     7) DOCTHEME    (name of the theme, default alabaster)

 Click [here](http://www.sphinx-doc.org/en/stable/theming.html#builtin-themes) to see a list of builtin themes.
 You can also specify any custom themes available on pypi.

 your git url should look like this
  ```shell
  https://<username>:<token>@github.com/<organisation or username>/<repname>
  ```
- add the following to travis.yml

If language is python

```yml
script:
- wget https://raw.githubusercontent.com/fossasia/yaydoc/master/generate.sh
- chmod +x ./generate.sh
- ./generate.sh
```

If language is not python

```yml
script:
- pip install --user virtualenv
- wget https://raw.githubusercontent.com/fossasia/yaydoc/master/generate.sh
- chmod +x ./generate.sh
- ./generate.sh
```
