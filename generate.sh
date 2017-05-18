#!/bin/bash

pip install sphinx
pip install recommonmark
pip install pypandoc
git clone https://github.com/fossasia/yaydoc.git yaydoctemp
cd yaydoctemp
sphinx-quickstart --ext-githubpages -q -v $VERSION -a $AUTHOR -p $PROJECTNAME -t templates/ -d html_theme=${DOCTHEME:-alabaster}
rm index.rst
cd ..
cp -a $DOCPATH. yaydoctemp/
cd yaydoctemp
make html
git config --global user.name "Bot"
git config --global user.email "noreply+bot@example.com"
git clone --quiet --branch=gh-pages $GITURL gh-pages
cd gh-pages
git rm -rf ./*
cp -a ../_build/html/. ./
if [[ -z "${DOCURL}" ]]; then
    echo -e "DOCURL not set. Using default github pages URL"
else
    echo $DOCURL > CNAME
fi
git add -f .
git commit -m "[Auto] Update Built Docs ($(date +%Y-%m-%d.%H:%M:%S))"
git push origin gh-pages
cd ../../
rm -rf yaydoctemp
rm -- "$0"
