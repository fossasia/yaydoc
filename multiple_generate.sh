#!/bin/bash

function cloneSubProject() {
  git clone $1 $2 && cd $_
  rm -rf .git
  SUB_ROOT_DIR=$(pwd)
  cd $3
  if [ ! -f index.rst ]; then
    echo -e "No index.rst found at $2/$3. Auto generating...\n"
    python $BASE/modules/scripts/genindex.py $SUB_ROOT_DIR
    if [ "${DEBUG:-false}" == "true" ]; then
      echo -e "\n--------------------------------------\n"
      cat index.rst
      echo -e "\n--------------------------------------\n"
    fi
    echo -e "Auto generated index.rst\n"
  fi
}

IFS=',' read -ra SUBPROJECT_URLS_ARRAY <<< "$SUBPROJECT_URLS"
IFS=',' read -ra SUBPROJECT_DOCPATHS_ARRAY <<< "$SUBPROJECT_DOCPATHS"

SUBPROJECT_DIRS_ARRAY=()

for ((i=0;i<${#SUBPROJECT_URLS_ARRAY[@]};i++)); do
  SUB_URL="${SUBPROJECT_URLS_ARRAY[$i]}"
  SUB_DOCPATH="${SUBPROJECT_DOCPATHS_ARRAY[$i]}"
  SUB_URL_SPLIT=(${SUB_URL//// })
  SUB_REPONAME=(${SUB_URL_SPLIT[3]//./ })
  SUBPROJECT_DIRS_ARRAY+=("${SUB_REPONAME}")
  cloneSubProject $SUB_URL $SUB_REPONAME $SUB_DOCPATH &
done

wait

# shellcheck disable=SC2034
SUBPROJECT_DIRS=$(IFS=, ; echo "${SUBPROJECT_DIRS_ARRAY[*]}")
