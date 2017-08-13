#!/bin/bash

function generateSubAPIDocs {
  # $1 :- repo name
  # $2 :- SUB project doc path
  cd ${BUILD_DIR}/${1}

  export SWAGGER_UI=""
  export SWAGGER_SPEC_URL=""
  export JAVADOC_PATH=""

  # Setting environment variables for api docs
  ENVVARS="$(python ${BASE}/modules/scripts/config/__main__.py)"
  echo -e "\n${ENVVARS}\n" >> ${LOGFILE}
  eval ${ENVVARS}

  generateAPIDocs ${BUILD_DIR}/${1} ${BUILD_DIR}/_build/html/${1}/${2}
}

for ((i=0;i<${#SUBPROJECT_URLS_ARRAY[@]};i++)); do
  generateSubAPIDocs ${SUBPROJECT_DIRS_ARRAY[i]} ${SUBPROJECT_DOCPATHS_ARRAY[$i]}
done
