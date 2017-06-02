#!/bin/bash
#
# Generates documentation from a Github repository using Sphinx-docs
#
# Environment Variables:
# $AUTHOR - Author of the repository.
# $DOCTHEME - Name of a Sphinx theme. (Built-in or Custom themes in PyPi)
# $DOCPATH - Path of the documentation inside the repository.
# $LOGO - An image used as a logo in the generated website.
# $PROJECTNAME - Name of the Project.
# $VERSION - Current version of the project.

# Create an isolated Python environment
virtualenv -q --python=python yaydocvenv
source yaydocvenv/bin/activate

git clone -q https://github.com/fossasia/yaydoc.git yaydocclone

mkdir yaydoctemp
cp -a yaydocclone/scripts/ yaydoctemp/
cp -a yaydocclone/templates/ yaydoctemp/
cp -a yaydocclone/requirements.txt yaydoctemp/

cd yaydoctemp
mkdir _themes

# Install packages required for documentation generation
pip install -q -r requirements.txt

# Setting up documentation sources
sphinx-quickstart --ext-githubpages -q -v $VERSION -a $AUTHOR -p $PROJECTNAME -t templates/ -d html_theme=${DOCTHEME:-alabaster} -d html_logo=${LOGO:-} > /dev/null

rm index.rst
cd ..

# Extract markup files from source repository and extend pre-existing conf.py
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

# Running the script to publish documentation
source <(curl -s https://raw.githubusercontent.com/fossasia/yaydoc/master/publish_docs.sh)
