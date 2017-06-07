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

REPO=`git config remote.origin.url`
SSH_REPO=${REPO/https:\/\/github.com\//git@github.com:}

# Create an isolated Python environment
virtualenv -q --python=python $HOME/yaydocvenv
source $HOME/yaydocvenv/bin/activate

git clone -q https://github.com/fossasia/yaydoc.git yaydocclone

ROOT_DIR=$(pwd)

# Setting up build directory
if [ "$DOCPATH" != "." ]; then
  cd $DOCPATH/../
fi
mkdir yaydoctemp
BUILD_DIR=$(pwd)/yaydoctemp

cd $ROOT_DIR

cp -a yaydocclone/scripts/ $BUILD_DIR/
cp -a yaydocclone/templates/ $BUILD_DIR/
cp -a yaydocclone/requirements.txt $BUILD_DIR/

cd $BUILD_DIR
mkdir _themes

# Install packages required for documentation generation
pip install -q -r requirements.txt

# Setting up documentation sources
sphinx-quickstart --ext-githubpages -q -v $VERSION -a $AUTHOR -p $PROJECTNAME -t templates/ -d html_theme=${DOCTHEME:-alabaster} -d html_logo=${LOGO:-} > /dev/null
if [ $? -ne 0 ]; then
  echo -e "Failed to initialize build process.\n"
  exit 1
fi

rm index.rst
cd $ROOT_DIR

cp -a yaydocclone/fossasia $BUILD_DIR/_themes/
rm -rf yaydocclone

# Extract markup files from source repository and extend pre-existing conf.py
if [ -f $DOCPATH/conf.py ]; then
    echo >> $BUILD_DIR/conf.py
    cat $DOCPATH/conf.py >> $BUILD_DIR/conf.py
fi

rsync -a --exclude=conf.py --exclude=yaydoctemp $DOCPATH/ $BUILD_DIR/
cd $BUILD_DIR

make html
if [ $? -ne 0 ]; then
  echo -e "Failed to generate documentation.\n"
  exit 2
fi

# Running the script to publish documentation
source <(curl -s https://raw.githubusercontent.com/fossasia/yaydoc/master/publish_docs.sh)
