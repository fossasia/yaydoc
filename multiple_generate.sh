#!/bin/bash

function clean() {
  rm -rf $BUILD_DIR
}

function cloner() {
  URL_SPLIT=(${1//// })
  REPONAME=(${URL_SPLIT[3]//./ })
  git clone $1 ${REPONAME}_temp &
}

function repoCleaner() {
  URL_SPLIT=(${1//// })
  REPONAME=(${URL_SPLIT[3]//./ })
  cd ${REPONAME}_temp
  mkdir ../$REPONAME
  cp -a docs/. ../$REPONAME/.
  cd ..
  rm -rf ${REPONAME}_temp
}

BASE=$(pwd)

if [ "${WEBUI:-false}" == "true" ]; then
  BUILD_DIR=$(pwd)/temp/$EMAIL/$UNIQUEID
  mkdir -p $BUILD_DIR
  cd $BUILD_DIR
else
  git clone https://github.com/fossasia/yaydoc.git yaydocclone
  BASE=$(pwd)/yaydocclone
  BUILD_DIR=$(pwd)/temp
  echo -e "build dir"
  echo -e $BUILD_DIR
  mkdir -p $BUILD_DIR
  cd $BUILD_DIR
fi

cloner $GITURL

IFS=', ' read -r -a SUBPROJECTS <<< "$SUBPROJECT"

for element in "${SUBPROJECTS[@]}"
do
  cloner $element
done

wait

repoCleaner $GITURL
for element in "${SUBPROJECTS[@]}"
do
  repoCleaner $element
done

cp -a ${BASE}/modules/scripts/ $BUILD_DIR/
cp -a ${BASE}/modules/templates/ $BUILD_DIR/

mkdir _themes

cp -a ${BASE}/fossasia_theme $BUILD_DIR/_themes/

URL_SPLIT=(${GITURL//// })
USERNAME=${URL_SPLIT[2]}
REPONAME=(${URL_SPLIT[3]//./ })

pip install -r $BASE/requirements.txt
sphinx-quickstart -q -v "($(date +%Y-%m-%d.%H:%M:%S))" -a $USERNAME -p $REPONAME -t templates/ -d html_theme=alabaster -d html_logo=$LOGO

rm index.rst

python $BASE/modules/scripts/genindex.py ./
make html
shopt -s extglob
if [ "${WEBUI:-false}" == "true" ]; then


  rm -r !(_build)

  cp -a _build/html/. ./

  rm -r _build

  cd ..
  mv ${UNIQUEID} ${UNIQUEID}_preview
  zip -r -q ${UNIQUEID}.zip ${UNIQUEID}_preview
else
  source <(curl -s https://raw.githubusercontent.com/fossasia/yaydoc/master/publish_docs.sh)
fi
