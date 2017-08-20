#!/bin/bash

function cloneSubProject() {
  git clone ${1} ${2} && cd ${_}
  rm -rf .git
  SUB_ROOT_DIR=$(pwd)

  export SWAGGER_UI=""
  export SWAGGER_SPEC_URL=""
  export JAVADOC_PATH=""
  export AUTOINDEX_INCLUDE_FILES="[]"
  export AUTOINDEX_INCLUDE_APIDOC=""
  export AUTOINDEX_INCLUDE_JAVADOC=""
  export AUTOINDEX_INCLUDE_TOC=""
  export AUTOINDEX_INCLUDE_SWAGGER=""
  export AUTOINDEX_RSS_URL=""
  export AUTOINDEX_TWEETS_QUERY=""

  # Setting environment variables for api docs
  ENVVARS="$(python ${BASE}/modules/scripts/config/__main__.py)"
  echo -e "\n${ENVVARS}\n" >> ${LOGFILE}
  eval ${ENVVARS}
  cd ${3}

  if [ -d _static ]; then
    print_log "$2: Copying static files..."
    cp -R _static/. ${BUILD_DIR}/_static
    print_log "done\n"
  fi

  if [ ! -f index.rst ] && [ ! -f index.md ]; then
    echo -e "No index.rst found at $2/$3. Auto generating...\n"
    python ${BASE}/modules/scripts/genindex.py ${SUB_ROOT_DIR}
    if [ "${DEBUG:-false}" == "true" ]; then
      echo -e "\n--------------------------------------\n"
      cat index.rst
      echo -e "\n--------------------------------------\n"
    fi
    echo -e "Auto generated index.rst at $2/$3\n"
  fi
}

IFS=',' read -ra SUBPROJECT_URLS_ARRAY <<< "$(python -c 'import os; print (os.environ["SUBPROJECT_URLS"].strip("[]"));')"
IFS=',' read -ra SUBPROJECT_DOCPATHS_ARRAY <<< "$(python -c 'import os; print (os.environ["SUBPROJECT_DOCPATHS"].strip("[]"));')"

SUBPROJECT_DIRS_ARRAY=()

for ((i=0;i<${#SUBPROJECT_URLS_ARRAY[@]};i++)); do
  SUB_URL="${SUBPROJECT_URLS_ARRAY[$i]}"
  SUB_DOCPATH="${SUBPROJECT_DOCPATHS_ARRAY[$i]}"
  SUB_URL_SPLIT=(${SUB_URL//// })
  SUB_REPONAME=${SUB_URL_SPLIT[3]%.git}
  SUBPROJECT_DIRS_ARRAY+=("${SUB_REPONAME}")
  cloneSubProject ${SUB_URL} ${SUB_REPONAME} ${SUB_DOCPATH} &
done

wait

# shellcheck disable=SC2034
SUBPROJECT_DIRS="[$(IFS=, ; echo "${SUBPROJECT_DIRS_ARRAY[*]}")]"
