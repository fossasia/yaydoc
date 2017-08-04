#!/bin/bash

source logging.sh

while getopts g:t:d:m:u:s:p:b:l: option
do
 case "${option}"
 in
 g) GITURL=${OPTARG};;
 t) export DOCTHEME=${OPTARG};;
 d) export DEBUG=${OPTARG};;
 m) EMAIL=${OPTARG};;
 u) UNIQUEID=${OPTARG};;
 s) export SUBPROJECT_URLS=${OPTARG};;
 p) export SUBPROJECT_DOCPATHS=${OPTARG};;
 b) TARGET_BRANCH=${OPTARG};;
 l) export DOCPATH=${OPTARG};;
 esac
done

function generateAPIDocs {
  # $1 :- CLONED REPO DIR
  # $2 :- RESULT DIR
  cd ${1}
  export SWAGGER_UI=""
  export SWAGGER_SPEC_URL=""
  export JAVADOC_PATH=""

  # Setting environment variables for api docs
  ENVVARS="$(python ${BASE}/modules/scripts/config.py)"
  echo -e "\n${ENVVARS}\n" >> ${LOGFILE}
  eval ${ENVVARS}

  if [ -n "${SWAGGER_SPEC_URL}" ]; then
    if [ "${SWAGGER_UI}" == "swagger" ]; then
      STABLE_SWAGGER=$(curl -s https://api.github.com/repos/swagger-api/swagger-ui/releases/latest  | grep tarball_url | cut -d '"' -f 4) >/dev/null 2>&1
      wget -O swagger.tar.gz ${STABLE_SWAGGER} >/dev/null 2>&1
      mkdir swagger
      tar -xf swagger.tar.gz --strip-components=1 -C swagger >/dev/null 2>&1
      cp -r swagger/dist/. ${2}/apidocs
      sed -i -e "s|http://petstore.swagger.io/v2/swagger.json|${SWAGGER_SPEC_URL}|g" ${2}/apidocs/index.html
    fi
  fi

  if [[  -n "${JAVADOC_PATH}" ]]; then
    javadoc -sourcepath ${1}/${JAVADOC_PATH} -d ${2}/javadoc -subpackages . >> ${LOGFILE} 2>>${LOGFILE}
  fi
}

URL_SPLIT=(${GITURL//// })

PLATFORM=${URL_SPLIT[1]}
OWNER=${URL_SPLIT[2]}
REPONAME=${URL_SPLIT[3]%.git}

# https://stackoverflow.com/a/15454916/4127836
INVENV=$(python -c 'import sys; print ("true" if hasattr(sys, "real_prefix") else "false")')

# Ensures that BASE has contents of yaydoc repository
# and change current directory to git repository.
BASE=$(pwd)
LOGFILE=${BASE}/temp/${EMAIL}/generate_${UNIQUEID}.txt

mkdir -p temp/${EMAIL} && cd $_
print_log "Cloning Repository...\n"
CLONE_URL=https://:@${PLATFORM}/${OWNER}/${REPONAME}

if [ -z "${TARGET_BRANCH}" ]; then
  git clone "${CLONE_URL}" "${UNIQUEID}" >>${LOGFILE} 2>>${LOGFILE}
else
  git clone -b "${TARGET_BRANCH}" "${CLONE_URL}" "${UNIQUEID}" >>${LOGFILE} 2>>${LOGFILE}
fi

if [ ${?} -ne 0 ]; then
  print_danger "Failed to Clone. Either the repository or the specified branch in that repository does not exist.\n"
  exit 4
fi

cd ${UNIQUEID}
print_log "Repository Cloned Successfully!\n"

if [ -z "${DOCPATH}" ]; then
  print_danger "DOCPATH isn't specified. Default value of 'docs' or configuration from .yaydoc.yml is used"
fi

ROOT_DIR=$(pwd)

if [ -z "${DEPLOYMENT}" ]; then
  # Create an isolated Python environment
  if [ "${INVENV}" == "false" ]; then
    print_log "Installing virtualenv\n"
    pip install --user virtualenv >>${LOGFILE} 2>>${LOGFILE}
    print_log "Installation successful\n"

    print_log "Creating an isolated Python environment\n"
    virtualenv --python=python ${HOME}/yaydocvenv >>${LOGFILE} 2>>${LOGFILE}
    source ${HOME}/yaydocvenv/bin/activate
    print_log "Python environment created successfully!\n"
  fi

  # Install packages required for documentation generation
  print_log "Installing dependencies...\n"
  pip install -r ${BASE}/requirements.txt >>${LOGFILE} 2>>${LOGFILE}
  print_log "Installation successful\n"
fi

# Copying yaml file
cp .yaydoc.yml ${BASE}/temp/${EMAIL}/${UNIQUEID}.yaydoc.yml >>${LOGFILE} 2>>${LOGFILE}

# Setting environment variables
ENVVARS="$(python ${BASE}/modules/scripts/config.py)"
echo -e "\n${ENVVARS}\n" >> ${LOGFILE}
eval ${ENVVARS}

if [ ! -d ${ROOT_DIR}/${DOCPATH} ]; then
  print_danger "The DOCPATH (${DOCPATH}) does not exist.\n"
  exit 5
fi

# Setting up build directory
if [ "${DOCPATH}" != "." ]; then
  cd ${DOCPATH}/../ 2>>${LOGFILE}
fi

mkdir yaydoctemp
BUILD_DIR=$(pwd)/yaydoctemp

cd ${ROOT_DIR}

cp -a ${BASE}/modules/scripts/ ${BUILD_DIR}/
cp -a ${BASE}/modules/templates/ ${BUILD_DIR}/

cd ${BUILD_DIR}
mkdir -p _themes

# Setting up documentation sources
print_log "Setting up documentation sources\n"

sphinx-quickstart -q -v "$VERSION" -a "$AUTHOR" -p "$PROJECTNAME" -t templates/ -d html_theme=$DOCTHEME \
  -d html_logo=$LOGO -d root_dir=$ROOT_DIR -d autoapi_python=$AUTOAPI_PYTHON -d mock_modules=$MOCK_MODULES \
  -d owner=$OWNER -d repo=$REPONAME -d github_ribbon_enable=$GITHUB_RIBBON_ENABLE \
  -d github_ribbon_position=$GITHUB_RIBBON_POSITION -d github_ribbon_color=$GITHUB_RIBBON_COLOR \
  -d theme_opts_keys=$DOCTHEME_OPTIONS_KEYS -d theme_opts_values=$DOCTHEME_OPTIONS_VALUES \
  -d github_button_enable=${GITHUB_BUTTON_ENABLE} -d github_buttons=${GITHUB_BUTTONS} \
  -d github_button_large=${GITHUB_BUTTON_LARGE} -d github_button_show_count=${GITHUB_BUTTON_SHOW_COUNT} \
  >>${LOGFILE} 2>>${LOGFILE}

if [ $? -ne 0 ]; then
  print_danger "Failed to initialize build process.\n"
  exit 1
fi
print_log "Documentation setup successful!\n"

rm index.rst
cd ${ROOT_DIR}

# Extract markup files from source repository and extend pre-existing conf.py
if [ -f ${DOCPATH}/conf.py ]; then
  echo >> ${BUILD_DIR}/conf.py
  cat ${DOCPATH}/conf.py >> ${BUILD_DIR}/conf.py
fi

rsync -a --exclude=conf.py --exclude=yaydoctemp ${DOCPATH}/ ${BUILD_DIR}/ 2>>${LOGFILE}
cd ${BUILD_DIR}

if [ "${AUTOAPI_PYTHON:-false}" == "true" ]; then
  # autodoc imports the module while building source files. To avoid
  # ImportError, install any packages in requirements.txt of the project
  # if available
  if [ -f ${ROOT_DIR}/setup.py ]; then
    pip install ${ROOT_DIR}/ >>${LOGFILE} 2>>${LOGFILE}
  elif [ -f ${ROOT_DIR}/requirements.txt ]; then
    pip install -r ${ROOT_DIR}/requirements.txt >>${LOGFILE} 2>>${LOGFILE}
  fi
  sphinx-apidoc -o source/ ${ROOT_DIR}/${AUTOAPI_PYTHON_PATH}/ >>${LOGFILE} 2>>${LOGFILE}
fi

if [ "${AUTOAPI_JAVA:-false}" == "true" ]; then
  javasphinx-apidoc -o source/ ${ROOT_DIR}/${AUTOAPI_JAVA_PATH}/ >>${LOGFILE} 2>>${LOGFILE}
fi

if [ -n "${SUBPROJECT_URLS}" ]; then
  source ${BASE}/multiple_generate.sh
fi

if [ ! -f index.rst ] && [ ! -f index.md ]; then
  print_danger "No index.rst found. Auto generating...\n"
  GENINDEX_PARAM=${ROOT_DIR}
  if [ "${DOCPATH}" == "." ]; then
    GENINDEX_PARAM=${ROOT_DIR}/yaydoctemp
  fi
  python ${BASE}/modules/scripts/genindex.py -j "${JAVADOC_PATH}" -s "${SUBPROJECT_DIRS}" -d "${SUBPROJECT_DOCPATHS}" "${GENINDEX_PARAM}"
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

generateAPIDocs ${ROOT_DIR} ${BUILD_DIR}/_build/html

if [ -n "${SUBPROJECT_URLS}" ]; then
  source ${BASE}/multiple_api_docs.sh
fi

print_log "Setting up documentation for Download and Preview\n"
mv ${BUILD_DIR}/_build/html ${ROOT_DIR}/../${UNIQUEID}_preview && cd $_/../
rm -rf ${BASE}/temp/${EMAIL}/${UNIQUEID}
zip -r ${UNIQUEID}.zip ${UNIQUEID}_preview >>${LOGFILE} 2>>${LOGFILE}
if [ $? -ne 0 ]; then
  print_danger "Failed setting up.\n"
  exit 3
fi

print_log "Documentation setup successful!\n"
