#!/bin/bash

virtualenv -q --python=python yaydocvenv
source yaydocvenv/bin/activate
git clone -q https://github.com/fossasia/yaydoc.git yaydocclone
mkdir yaydoctemp
cp -a yaydocclone/scripts/ yaydoctemp/
cp -a yaydocclone/templates/ yaydoctemp/
cp -a yaydocclone/requirements.txt yaydoctemp/
cd yaydoctemp
mkdir _themes
pip install -q -r requirements.txt
sphinx-quickstart --ext-githubpages -q -v $VERSION -a $AUTHOR -p $PROJECTNAME -t templates/ -d html_theme=${DOCTHEME:-alabaster} -d html_logo=${LOGO:-} > /dev/null
rm index.rst
cd ..
if [ -f $DOCPATH/conf.py ]; then
    echo >> yaydoctemp/conf.py
    cat $DOCPATH/conf.py >> yaydoctemp/conf.py
    rsync -a $DOCPATH. yaydoctemp/ --exclude=conf.py
else
    cp -a $DOCPATH. yaydoctemp/
fi
cp -a yaydocclone/fossasia yaydoctemp/_themes/
cd yaydoctemp
make html
git config --global user.name "Bot"
git config --global user.email "noreply+bot@example.com"
git clone --quiet $GITURL gh-pages
cd gh-pages
git fetch
if ! git checkout gh-pages ; then
  git checkout -b gh-pages
fi
git rm -rfq ./*
cp -a ../_build/html/. ./
if [[ -z "${DOCURL}" ]]; then
    echo -e "DOCURL not set. Using default github pages URL"
else
    echo $DOCURL > CNAME
fi
git add -f .
git commit -q -m "[Auto] Update Built Docs ($(date +%Y-%m-%d.%H:%M:%S))"
git push origin gh-pages
cd ../../
rm -rf yaydocclone
rm -rf yaydoctemp
rm -rf yaydocvenv
deactivate
rm -- "$0"
