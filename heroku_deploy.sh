#!/bin/bash

source logging.sh

while getopts e:h:n:u: option
do
 case "${option}"
 in
 e) EMAIL=${OPTARG};;
 h) export HEROKU_API_KEY=${OPTARG};;
 n) HEROKU_APP_NAME=${OPTARG};;
 u) UNIQUEID=${OPTARG};;
 esac
done

BASE=$(pwd)
LOGFILE=${BASE}/temp/${EMAIL}/heroku_deploy_${UNIQUEID}.txt

# Setting environment variables
ENVVARS="$(python ${BASE}/modules/scripts/config/__main__.py --file=${BASE}/temp/${EMAIL}/${UNIQUEID}.yaydoc.yml)"
eval $ENVVARS

print_log "Setting up system for Heroku Deployment....\n"
STATUS_CODE=$(curl -s -o /dev/null -w '%{http_code}' -u ":$HEROKU_API_KEY" -n https://api.heroku.com/apps/${HEROKU_APP_NAME} -H "Accept: application/vnd.heroku+json; version=3");
if [ ${STATUS_CODE} -eq 403 ]; then
  print_danger "You do not have access to this Heroku Application\n"
  exit 1
fi

cd temp/${EMAIL}/${UNIQUEID}_preview

mkdir -p app
cd app

curl https://nodejs.org/dist/v6.11.0/node-v6.11.0-linux-x64.tar.gz 2>/dev/null | tar xzv >/dev/null 2>&1

cp $BASE/web.js .
rsync -av --progress ../ . --exclude app >>${LOGFILE} 2>>${LOGFILE}

cd ..
tar czfv slug.tgz ./app >/dev/null 2>&1

if [ ${STATUS_CODE} -eq 404 ]; then
  print_log "Creating Heroku app...\n"
  heroku create $HEROKU_APP_NAME >>${LOGFILE} 2>>${LOGFILE}
  if [ $? -ne 0 ]; then
    print_danger "Failed to create Heroku app.\n"
    rm -rf app
    exit 1
  fi
  print_log "Heroku app created successfully!\n"
fi

print_log "Registering a new slug...\n"
Arr=($(curl -u ":$HEROKU_API_KEY" -X POST \
-H 'Content-Type:application/json' \
-H 'Accept: application/vnd.heroku+json; version=3' \
-d '{"process_types": {"web":"node-v6.11.0-linux-x64/bin/node web.js"}}' \
-n https://api.heroku.com/apps/${HEROKU_APP_NAME}/slugs 2>>${LOGFILE} | \
python -c "import sys, json; obj=json.load(sys.stdin); print(obj['blob']['url'] + '\n' +obj['id'])"))
print_log "Slug registered successfully!\n"

print_log "Uploading slug to the URL provided by Heroku...\n"
status=$(curl  -s -o /dev/null -w "%{http_code}" -X PUT \
-H "Content-Type:" \
--data-binary @slug.tgz \
"${Arr[0]}")
if [ ${status} -ne 200 ]; then
  print_danger "Failed to upload. Error Code: ${status}\n"
  rm -rf app
  exit 2
fi
print_log "Slug uploaded successfully!\n"

print_log "Releasing the slug to app...\n"
status=$(curl  -s -o /dev/null -w "%{http_code}" -u ":$HEROKU_API_KEY" -X POST \
-H "Accept: application/vnd.heroku+json; version=3" \
-H "Content-Type:application/json" \
-d '{"slug":"'${Arr[1]}'"}' \
-n https://api.heroku.com/apps/$HEROKU_APP_NAME/releases)
if [ ${status} -ne 201 ]; then
  print_danger "Failed to release the slug. Error Code: ${status}\n"
  rm -rf app
  exit 3
fi
print_log "Slug released successfully\n Application available at https://${HEROKU_APP_NAME}.herokuapp.com/\n"
