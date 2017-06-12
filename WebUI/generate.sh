#!/bin/bash

echo "Setting Environment Variables..."
while getopts g:a:t:p:o:v:m:u: option
do
 case "${option}"
 in
 g) GITURL=${OPTARG};;
 a) AUTHOR=${OPTARG};;
 t) DOCTHEME=${OPTARG};;
 p) DOCPATH=${OPTARG};;
 o) PROJECTNAME=${OPTARG};;
 v) VERSION=${OPTARG};;
 m) EMAIL=${OPTARG};;
 u) UNIQUEID=${OPTARG};;
 esac
done
echo "Done..."

mkdir -p temp/${EMAIL} && cd $_
echo "Moved to $(pwd)"
echo "Cloning Repository..."
git clone -q ${GITURL} "$PROJECTNAME" && cd $_
echo "Repository Cloned"
REPO=$(git config remote.origin.url)

# Create an isolated Python environment
virtualenv -q --python=python $HOME/yaydocvenv
source $HOME/yaydocvenv/bin/activate


ROOT_DIR=$(pwd)

# Setting up build directory
if [ "$DOCPATH" != "." ]; then
  cd $DOCPATH/../
fi
echo $DOCPATH
pwd
mkdir yaydoctemp
BUILD_DIR=$(pwd)/yaydoctemp

cd $ROOT_DIR

cp -a ../../../../scripts/ $BUILD_DIR/
cp -a ../../../../templates/ $BUILD_DIR/
cp -a ../../../../requirements.txt $BUILD_DIR/

cd ${BUILD_DIR}
mkdir _themes

# Install packages required for documentation generation
pip install -q -r requirements.txt

URL_SPLIT=(${REPO//// })
AUTHOR=${AUTHOR:-${URL_SPLIT[2]}}
DEFAULT_NAME=(${URL_SPLIT[3]//./ })
PROJECTNAME=${PROJECTNAME:-${DEFAULT_NAME}}

# Setting up documentation sources
sphinx-quickstart --ext-githubpages -q -v "${VERSION:-development}" -a "$AUTHOR" -p "$PROJECTNAME" -t templates/ -d html_theme=${DOCTHEME:-alabaster} -d html_logo=${LOGO:-} > /dev/null
if [ $? -ne 0 ]; then
  echo -e "Failed to initialize build process.\n"
  exit 1
fi

rm index.rst
cd $ROOT_DIR

cp -a ../../../../fossasia $BUILD_DIR/_themes/

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

mv $BUILD_DIR/_build/html $ROOT_DIR/../${UNIQUEID}_preview && cd $_/../
zip -r -q ${UNIQUEID}.zip ${UNIQUEID}_preview
if [ $? -eq 0 ]; then
  echo -e "Generated docs.\n"
  exit 0
fi
