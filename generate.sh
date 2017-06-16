#!/bin/bash

while getopts g:t:m:u:w: option
do
 case "${option}"
 in
 g) GITURL=${OPTARG};;
 t) export DOCTHEME=${OPTARG};;
 m) EMAIL=${OPTARG};;
 u) UNIQUEID=${OPTARG};;
 w) WEBUI=${OPTARG};;
 esac
done

# Ensures that BASE has contents of yaydoc repository
# and change current directory to git repository.
if [ "${WEBUI:-false}" == "true" ]; then
  BASE=$(pwd)
  mkdir -p temp/${EMAIL} && cd $_

  echo -e "Cloning Repository...\n"
  git clone -q ${GITURL} "$UNIQUEID" && cd $_
  echo -e "Repository Cloned Successfully!\n"
else
  git clone -q https://github.com/fossasia/yaydoc.git yaydocclone
  BASE=$(pwd)/yaydocclone
fi

REPO=$(git config remote.origin.url)
URL_SPLIT=(${REPO//// })

USERNAME=${URL_SPLIT[2]}
REPONAME=(${URL_SPLIT[3]//./ })

ROOT_DIR=$(pwd)

if [ -z "$ON_HEROKU" ]; then
  # Create an isolated Python environment
  echo -e "Creating an isolated Python environment\n"
  virtualenv -q --python=python $HOME/yaydocvenv
  source $HOME/yaydocvenv/bin/activate
  echo -e "Python environment created successfully!\n"

  # Install packages required for documentation generation
  echo -e "Installing packages required for documentation generation\n"
  pip install -q -r $BASE/modules/requirements.txt
  echo -e "Installation successful\n"
fi

# Setting environment variables
ENVVARS="$(python ${BASE}/modules/scripts/config.py "${USERNAME}" "${REPONAME}")"
echo -e "\n${ENVVARS}\n"
eval $ENVVARS

# Setting up build directory
if [ "$DOCPATH" != "." ]; then
  cd $DOCPATH/../
fi
mkdir yaydoctemp
BUILD_DIR=$(pwd)/yaydoctemp

cd $ROOT_DIR

cp -a ${BASE}/modules/scripts/ $BUILD_DIR/
cp -a ${BASE}/modules/templates/ $BUILD_DIR/
cp -a ${BASE}/modules/requirements.txt $BUILD_DIR/

cd ${BUILD_DIR}
mkdir _themes

# Setting up documentation sources
echo -e "Setting up documentation sources\n"
sphinx-quickstart --ext-githubpages -q -v "$VERSION" -a "$AUTHOR" -p "$PROJECTNAME" -t templates/ -d html_theme=$DOCTHEME -d html_logo=$LOGO > /dev/null
if [ $? -ne 0 ]; then
  echo -e "Failed to initialize build process.\n"
  exit 1
fi
echo -e "Documentation setup successful!\n"

rm index.rst
cd $ROOT_DIR

cp -a ${BASE}/fossasia_theme $BUILD_DIR/_themes/

# Extract markup files from source repository and extend pre-existing conf.py
if [ -f $DOCPATH/conf.py ]; then
    echo >> $BUILD_DIR/conf.py
    cat $DOCPATH/conf.py >> $BUILD_DIR/conf.py
fi

rsync -a --exclude=conf.py --exclude=yaydoctemp $DOCPATH/ $BUILD_DIR/
cd $BUILD_DIR

echo -e "Starting Documentation Generation...\n"
make html
if [ $? -ne 0 ]; then
  echo -e "Failed to generate documentation.\n"
  exit 2
fi
echo -e "Documentation Generated Successfully!\n"

if [ "${WEBUI:-false}" == "true" ]; then
  echo -e "Setting up documentation for Download and Preview\n"
  mv $BUILD_DIR/_build/html $ROOT_DIR/../${UNIQUEID}_preview && cd $_/../
  rm -r $BASE/temp/$EMAIL/$UNIQUEID
  zip -r -q ${UNIQUEID}.zip ${UNIQUEID}_preview
  if [ $? -ne 0 ]; then
    echo -e "Failed setting up.\n"
    exit 3
  fi
fi

echo -e "Documentation setup successful!\n"
