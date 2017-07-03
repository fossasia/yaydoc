#!/bin/bash

while getopts e:h:n:u:w: option
do
 case "${option}"
 in
 e) EMAIL=${OPTARG};;
 h) export HEROKU_API_KEY=${OPTARG};;
 n) HEROKU_APP_NAME=${OPTARG};;
 u) UNIQUE_ID=${OPTARG};;
 w) WEBUI=${OPTARG};;
 esac
done

if [ "${WEBUI:-false}" == "true" ]; then
  BASE=$(pwd)
  cd temp/$EMAIL/${UNIQUE_ID}_preview
else
  cd _build/html
fi

mkdir -p app
cd app

curl https://nodejs.org/dist/v6.11.0/node-v6.11.0-linux-x64.tar.gz | tar xzv > /dev/null

cp $BASE/web.js .
rsync -av --progress ../ . --exclude app

cd ..
tar czfv slug.tgz ./app > /dev/null

heroku create $HEROKU_APP_NAME

Arr=($(curl -u ":$HEROKU_API_KEY" -X POST \
-H 'Content-Type:application/json' \
-H 'Accept: application/vnd.heroku+json; version=3' \
-d '{"process_types": {"web":"node-v6.11.0-linux-x64/bin/node web.js"}}' \
-n https://api.heroku.com/apps/${HEROKU_APP_NAME}/slugs | \
python -c "import sys, json; obj=json.load(sys.stdin); print(obj['blob']['url'] + '\n' +obj['id'])"))

curl -X PUT \
-H "Content-Type:" \
--data-binary @slug.tgz \
"${Arr[0]}"

curl -u ":$HEROKU_API_KEY" -X POST \
-H "Accept: application/vnd.heroku+json; version=3" \
-H "Content-Type:application/json" \
-d '{"slug":"'${Arr[1]}'"}' \
-n https://api.heroku.com/apps/$HEROKU_APP_NAME/releases

heroku releases --app $HEROKU_APP_NAME
