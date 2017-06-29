#!/bin/bash

while getopts g:t:d:m:u:w:s: option
do
 case "${option}"
 in
 g) GITURL=${OPTARG};;
 t) export DOCTHEME=${OPTARG};;
 d) export DEBUG=${OPTARG};;
 m) EMAIL=${OPTARG};;
 u) UNIQUEID=${OPTARG};;
 w) WEBUI=${OPTARG};;
 s) SUBPROJECT=${OPTARG};;
 esac
done

# https://stackoverflow.com/a/15454916/4127836
INVENV=$(python -c 'import sys; print ("true" if hasattr(sys, "real_prefix") else "false")')

# Ensures that BASE has contents of yaydoc repository
# and change current directory to git repository.
if [ "${WEBUI:-false}" == "true" ]; then
  BASE=$(pwd)
  if ! [ "${SUBPROJECT}" == "" ]; then
    . ./multiple_generate.sh
    exit 0
  else
    mkdir -p temp/${EMAIL} && cd $_
    echo -e "Cloning Repository...\n"
    git clone -q ${GITURL} "$UNIQUEID" && cd $_
    echo -e "Repository Cloned Successfully!\n"
  fi
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
  if [ "$INVENV" == "false" ]; then
    echo -e "Installing virtualenv\n"
    pip install -q --user virtualenv
    echo -e "Installation successful\n"

    echo -e "Creating an isolated Python environment\n"
    virtualenv -q --python=python $HOME/yaydocvenv
    source $HOME/yaydocvenv/bin/activate
    echo -e "Python environment created successfully!\n"
  fi

  # Install packages required for documentation generation
  echo -e "Installing packages required for documentation generation\n"
  pip install -q -r $BASE/requirements.txt
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

cd ${BUILD_DIR}
mkdir _themes

# Setting up documentation sources
echo -e "Setting up documentation sources\n"
sphinx-quickstart -q -v "$VERSION" -a "$AUTHOR" -p "$PROJECTNAME" -t templates/ -d html_theme=$DOCTHEME -d html_logo=$LOGO > /dev/null
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

# Extracting docstrings if PYTHON_PACKAGE is defined
if [ -n "$PYTHON_PACKAGE" ]; then
  # sphinx-build imports the module while building source files. To avoid
  # ImportError, install any packages in requirements.txt of the project
  # if available
  if [ -f $ROOT_DIR/requirements.txt ]; then
    echo -e "Installing requirements for sphinx-apidoc"
    pip install -q -r $ROOT_DIR/requirements.txt
    echo -e "Installed successfully"
  fi
  sphinx-apidoc -o source/ $ROOT_DIR/$PYTHON_PACKAGE
fi

if [ ! -f index.rst ]; then
  echo -e "No index.rst found. Auto generating...\n"
  python $BASE/modules/scripts/genindex.py $ROOT_DIR
  if [ "${DEBUG:-false}" == "true" ]; then
    echo -e "\n--------------------------------------\n"
    cat index.rst
    echo -e "\n--------------------------------------\n"
  fi
  echo -e "Auto generated index.rst\n"
fi

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
  rm -rf $BASE/temp/$EMAIL/$UNIQUEID
  zip -r -q ${UNIQUEID}.zip ${UNIQUEID}_preview
  if [ $? -ne 0 ]; then
    echo -e "Failed setting up.\n"
    exit 3
  fi
fi

echo -e "Documentation setup successful!\n"
