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
URL_SPLIT=(${REPO//// })

USERNAME=${URL_SPLIT[2]}
REPONAME=(${URL_SPLIT[3]//./ })

# Create an isolated Python environment
virtualenv -q --python=python $HOME/yaydocvenv
source $HOME/yaydocvenv/bin/activate

git clone -q https://github.com/fossasia/yaydoc.git yaydocclone

ROOT_DIR=$(pwd)

# Install packages required for documentation generation
pip install -q -r yaydocclone/requirements.txt

# Reading configuration file
ENVVARS="$(python ./yaydocclone/scripts/config.py "$USERNAME" "$REPONAME")"
echo -e "\n$ENVVARS\n"
eval $ENVVARS

# Setting up build directory
if [ "$DOCPATH" != "." ]; then
  cd $DOCPATH/../
fi
mkdir yaydoctemp
BUILD_DIR=$(pwd)/yaydoctemp

cd $ROOT_DIR

cp -a yaydocclone/modules/scripts/ $BUILD_DIR/
cp -a yaydocclone/modules/templates/ $BUILD_DIR/
cp -a yaydocclone/modules/requirements.txt $BUILD_DIR/

cd $BUILD_DIR
mkdir _themes

# cleanup
function clean() {
  cd $ROOT_DIR
  rm -rf $BUILD_DIR
  deactivate
  rm -- "$0"
}

# Setting up documentation sources
sphinx-quickstart --ext-githubpages -q -v "$VERSION" -a "$AUTHOR" -p "$PROJECTNAME" -t templates/ -d html_theme=$DOCTHEME -d html_logo=$LOGO > /dev/null
if [ $? -ne 0 ]; then
  echo -e "Failed to initialize build process.\n"
  clean
  exit 1
fi

rm index.rst
cd $ROOT_DIR

cp -a yaydocclone/fossasia_theme $BUILD_DIR/_themes/
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
  clean
  exit 2
fi

# Running the script to publish documentation
source <(curl -s https://raw.githubusercontent.com/fossasia/yaydoc/master/publish_docs.sh)
