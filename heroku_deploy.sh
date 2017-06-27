#!/bin/sh

while getopts e:h:n:u: option
do
 case "${option}"
 in
 e) EMAIL=${OPTARG};;
 h) API_KEY=${OPTARG};;
 n) APP_NAME=${OPTARG};;
 u) UNIQUE_ID=${OPTARG};;
 esac
done

export HEROKU_API_KEY=$API_KEY

BASE=$(pwd)

cd temp/$EMAIL/${UNIQUE_ID}_preview

mkdir -p app
cd app

curl https://nodejs.org/dist/v6.11.0/node-v6.11.0-linux-x64.tar.gz | tar xzv > /dev/null

cp $BASE/web.js .
rsync -av --progress ../ . --exclude app

cd ..
tar czfv slug.tgz ./app > /dev/null

heroku create $APP_NAME

Arr=($(curl -u ":$API_KEY" -X POST \
-H 'Content-Type:application/json' \
-H 'Accept: application/vnd.heroku+json; version=3' \
-d '{"process_types": {"web":"node-v6.11.0-linux-x64/bin/node web.js"}}' \
-n https://api.heroku.com/apps/${APP_NAME}/slugs | \
python3 -c "import sys, json; obj=json.load(sys.stdin); print(obj['blob']['url'] + '\n' +obj['id'])"))

curl -X PUT \
-H "Content-Type:" \
--data-binary @slug.tgz \
"${Arr[0]}"

curl -u ":$API_KEY" -X POST \
-H "Accept: application/vnd.heroku+json; version=3" \
-H "Content-Type:application/json" \
-d '{"slug":"'${Arr[1]}'"}' \
-n https://api.heroku.com/apps/$APP_NAME/releases

heroku releases --app $APP_NAME
