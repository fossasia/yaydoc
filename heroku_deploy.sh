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

echo "Setting up system for Heroku Deployment...."
STATUS_CODE=$(curl -s -o /dev/null -w '%{http_code}' -u ":$HEROKU_API_KEY" -n https://api.heroku.com/apps/${HEROKU_APP_NAME} -H "Accept: application/vnd.heroku+json; version=3");
if [ ${STATUS_CODE} -eq 403 ]; then
  echo "You do not have access to this Heroku Application"
  exit 1
fi

if [ "${WEBUI:-false}" == "true" ]; then
  BASE=$(pwd)
  cd temp/$EMAIL/${UNIQUE_ID}_preview
else
  cd _build/html
fi

mkdir -p app
cd app

curl https://nodejs.org/dist/v6.11.0/node-v6.11.0-linux-x64.tar.gz 2>/dev/null | tar xzv > /dev/null 2>&1

cp $BASE/web.js .
rsync -av --progress ../ . --exclude app >/dev/null 2>&1

cd ..
tar czfv slug.tgz ./app > /dev/null 2>&1

if [ ${STATUS_CODE} -eq 404 ]; then
  echo "Creating Heroku app..."
  heroku create $HEROKU_APP_NAME >/dev/null 2>&1
  if [ $? -ne 0 ]; then
    >&2 echo "Failed to create Heroku app."
    exit 1
  fi
  echo "Heroku app created successfully"
fi

echo "Registering a new slug..."
Arr=($(curl -u ":$HEROKU_API_KEY" -X POST \
-H 'Content-Type:application/json' \
-H 'Accept: application/vnd.heroku+json; version=3' \
-d '{"process_types": {"web":"node-v6.11.0-linux-x64/bin/node web.js"}}' \
-n https://api.heroku.com/apps/${HEROKU_APP_NAME}/slugs 2>/dev/null | \
python -c "import sys, json; obj=json.load(sys.stdin); print(obj['blob']['url'] + '\n' +obj['id'])"))
echo "Slug registered successfully!"

echo "Uploading slug to the URL provided by Heroku"
status=$(curl  -s -o /dev/null -w "%{http_code}" -X PUT \
-H "Content-Type:" \
--data-binary @slug.tgz \
"${Arr[0]}")
if [ ${status} -ne 200 ]; then
  >&2 echo "Failed to upload. Error Code: ${status}"
  exit 2
fi
echo "Slug uploaded successfully!"

echo "Releasing the slug to app..."
status=$(curl  -s -o /dev/null -w "%{http_code}" -u ":$HEROKU_API_KEY" -X POST \
-H "Accept: application/vnd.heroku+json; version=3" \
-H "Content-Type:application/json" \
-d '{"slug":"'${Arr[1]}'"}' \
-n https://api.heroku.com/apps/$HEROKU_APP_NAME/releases)
if [ ${status} -ne 201 ]; then
  >&2 echo "Failed to release the slug. Error Code: ${status}"
  exit 3
fi
echo -e "Slug released successfully\n Application available at https://${HEROKU_APP_NAME}.herokuapp.com/ "
