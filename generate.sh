#!/bin/bash

while getopts g:t:d:m:u:w:s:p:b: option
do
 case "${option}"
 in
 g) GITURL=${OPTARG};;
 t) export DOCTHEME=${OPTARG};;
 d) export DEBUG=${OPTARG};;
 m) EMAIL=${OPTARG};;
 u) UNIQUEID=${OPTARG};;
 w) WEBUI=${OPTARG};;
 s) export SUBPROJECT_URLS=${OPTARG};;
 p) export SUBPROJECT_DOCPATHS=${OPTARG};;
 b) TARGET_BRANCH=${OPTARG};;
 esac
done

LOGFILE='/dev/stdout'

function print_log {
  if [ -n "$LOGFILE" ]; then
    echo -e $1 | tee -a ${LOGFILE}
  else
    echo -e $1
  fi
}

function print_danger {
  if [ -n "$LOGFILE" ]; then
    >&2 echo -e $1 | tee -a ${LOGFILE}
  else
    >&2 echo -e $1
  fi
}

REPO=${GITURL:-$(git config remote.origin.url)}
URL_SPLIT=(${REPO//// })

PLATFORM=${URL_SPLIT[1]}
USERNAME=${URL_SPLIT[2]}
REPONAME=(${URL_SPLIT[3]//./ })

# https://stackoverflow.com/a/15454916/4127836
INVENV=$(python -c 'import sys; print ("true" if hasattr(sys, "real_prefix") else "false")')

# Ensures that BASE has contents of yaydoc repository
# and change current directory to git repository.
if [ "${WEBUI:-false}" == "true" ]; then
  BASE=$(pwd)
  LOGFILE=${BASE}/temp/${EMAIL}/${UNIQUEID}.txt
  mkdir -p temp/${EMAIL} && cd $_
  print_log "Cloning Repository...\n"
  CLONE_URL=https://:@${PLATFORM}/${USERNAME}/${REPONAME}
  if [ -z "$TARGET_BRANCH" ]; then
    git clone -q "$CLONE_URL" "$UNIQUEID" >/dev/null 2>&1
  else
    git clone -q -b "$TARGET_BRANCH" "$CLONE_URL" "$UNIQUEID" >/dev/null 2>&1
  fi
  if [ $? -ne 0 ]; then
    print_danger "Failed to Clone. Repository does not exist.\n"
    exit 4
  fi
  cd ${UNIQUEID}
  print_log "Repository Cloned Successfully!\n"
else
  git clone -q https://github.com/fossasia/yaydoc.git yaydocclone
  BASE=$(pwd)/yaydocclone
fi

ROOT_DIR=$(pwd)

if [ -z "$ON_HEROKU" ]; then
  # Create an isolated Python environment
  if [ "$INVENV" == "false" ]; then
    print_log "Installing virtualenv\n"
    pip install -q --user virtualenv
    print_log "Installation successful\n"

    print_log "Creating an isolated Python environment\n"
    virtualenv -q --python=python $HOME/yaydocvenv
    source $HOME/yaydocvenv/bin/activate
    print_log "Python environment created successfully!\n"
  fi

  # Install packages required for documentation generation
  print_log "Installing packages required for documentation generation\n"
  pip install -q -r $BASE/requirements.txt
  print_log "Installation successful\n"
fi

# Setting environment variables
ENVVARS="$(python ${BASE}/modules/scripts/config.py "${USERNAME}" "${REPONAME}")"
echo -e "\n${ENVVARS}\n" >> ${LOGFILE}
eval $ENVVARS

# Setting up build directory
if [ "$DOCPATH" != "." ]; then
  cd $DOCPATH/../ 2>>${LOGFILE}
fi

mkdir yaydoctemp
BUILD_DIR=$(pwd)/yaydoctemp

cd $ROOT_DIR

cp -a ${BASE}/modules/scripts/ $BUILD_DIR/
cp -a ${BASE}/modules/templates/ $BUILD_DIR/

cd ${BUILD_DIR}
mkdir -p _themes

# Setting up documentation sources
print_log "Setting up documentation sources\n"
sphinx-quickstart -q -v "$VERSION" -a "$AUTHOR" -p "$PROJECTNAME" -t templates/ -d html_theme=$DOCTHEME -d html_logo=$LOGO -d root_dir=$ROOT_DIR -d autoapi_python=$AUTOAPI_PYTHON -d mock_modules=$MOCK_MODULES >> ${LOGFILE}
if [ $? -ne 0 ]; then
  print_danger "Failed to initialize build process.\n"
  exit 1
fi
print_log "Documentation setup successful!\n"

rm index.rst
cd $ROOT_DIR

# Extract markup files from source repository and extend pre-existing conf.py
if [ -f $DOCPATH/conf.py ]; then
  echo >> $BUILD_DIR/conf.py
  cat $DOCPATH/conf.py >> $BUILD_DIR/conf.py
fi

rsync -a --exclude=conf.py --exclude=yaydoctemp --exclude=yaydocclone $DOCPATH/ $BUILD_DIR/ 2>>${LOGFILE}
cd $BUILD_DIR

if [ "${AUTOAPI_PYTHON:-false}" == "true" ]; then
  # autodoc imports the module while building source files. To avoid
  # ImportError, install any packages in requirements.txt of the project
  # if available
  if [ -f $ROOT_DIR/setup.py ]; then
    pip install $ROOT_DIR/
  elif [ -f $ROOT_DIR/requirements.txt ]; then
    pip install -q -r $ROOT_DIR/requirements.txt
  fi
  sphinx-apidoc -o source/ $ROOT_DIR/$AUTOAPI_PYTHON_PATH/
fi

if [ "${AUTOAPI_JAVA:-false}" == "true" ]; then
  javasphinx-apidoc -o source/ $ROOT_DIR/$AUTOAPI_JAVA_PATH/
fi

if [ -n "$SUBPROJECT_URLS" ]; then
  source $BASE/multiple_generate.sh
fi

if [ ! -f index.rst ]; then
  print_danger "No index.rst found. Auto generating...\n"
  GENINDEX_PARAM=$ROOT_DIR
  if [ "$DOCPATH" == "." ]; then
    GENINDEX_PARAM=$ROOT_DIR/yaydoctemp
  fi
  python $BASE/modules/scripts/genindex.py -s "$SUBPROJECT_DIRS" -d "$SUBPROJECT_DOCPATHS" "$GENINDEX_PARAM"
  if [ "${DEBUG:-false}" == "true" ]; then
    print_log "\n--------------------------------------\n"
    cat index.rst | tee -a ${LOGFILE}
    print_log "\n--------------------------------------\n"
  fi
  print_log "Auto generated index.rst\n"
fi

print_log "Starting Documentation Generation...\n"
make html >> ${LOGFILE} 2>>${LOGFILE}
if [ $? -ne 0 ]; then
  print_danger "Failed to generate documentation.\n"
  exit 2
fi
print_log "Documentation Generated Successfully!\n"

if [ "${WEBUI:-false}" == "true" ]; then
  print_log "Setting up documentation for Download and Preview\n"
  mv $BUILD_DIR/_build/html $ROOT_DIR/../${UNIQUEID}_preview && cd $_/../
  rm -rf $BASE/temp/$EMAIL/$UNIQUEID
  zip -r -q ${UNIQUEID}.zip ${UNIQUEID}_preview
  if [ $? -ne 0 ]; then
    print_danger "Failed setting up.\n"
    exit 3
  fi
fi

print_log "Documentation setup successful!\n"
