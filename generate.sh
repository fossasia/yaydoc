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

source <(curl -s https://raw.githubusercontent.com/fossasia/yaydoc/master/publish_docs.sh)
