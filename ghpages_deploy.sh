#!/bin/bash
#
# Publish the Sphinx generated documentation to Gihub Pages
#
# Environment Variables:
# $DOCURL - Custom URL where the documentation would be published.

source logging.sh

while getopts e:i:n:t:r:o: option
do
  case "${option}"
  in
  e) EMAIL=${OPTARG};;
  i) UNIQUEID=${OPTARG};;
  n) USERNAME=${OPTARG};;
  t) OAUTH_TOKEN=${OPTARG};;
  r) export REPONAME=${OPTARG};;
  o) export OWNER=${OPTARG};;
  esac
done

BASE=$(pwd)
LOGFILE=${BASE}/temp/${EMAIL}/ghpages_deploy_${UNIQUEID}.txt

# Setting environment variables
ENVVARS="$(python ${BASE}/modules/scripts/config/__main__.py --file=${BASE}/temp/${EMAIL}/${UNIQUEID}.yaydoc.yml)"
eval $ENVVARS

git config --global user.name "Yaydoc Bot"
git config --global user.email "noreply+bot@example.com"

GIT_HTTPS_URL=https://${USERNAME}:${OAUTH_TOKEN}@github.com/${OWNER}/${REPONAME}.git
cd temp/${EMAIL}

git clone ${GIT_HTTPS_URL} ${UNIQUEID}_pages >>${LOGFILE} 2>>${LOGFILE}

if [ $? -ne 0 ]; then
  print_danger "Failed to clone gh-pages.\n"
  clean
  exit 3
fi

print_log "Cloned successfully! \n"

cd ${UNIQUEID}_pages

# Create gh-pages branch if it doesn't exist
git fetch
if ! git checkout gh-pages ; then
  print_danger "gh-pages branch doesn't exist. Creating....\n"
  git checkout --orphan gh-pages
  print_log "gh-pages branch created!\n"
fi

# Overwrite files in the branch
print_log "Overwriting previous content with new changes!\n"
shopt -s extglob
rm -rf ./!(.git)

cp -a ../${UNIQUEID}_preview/. ./
print_log "Overwrite successful \n"

# Enable publishing documentation to custom URL
if [ -z "$DOCURL" ]; then
  print_danger "DOCURL not set. Using default github pages URL"
else
  print_log "DOCURL set."
  echo $DOCURL > CNAME
fi

# Publish documentation
print_log "Publishing documentation....\n"
git add -f .
git commit -m "[Auto] Update Built Docs ($(date +%Y-%m-%d.%H:%M:%S))" >>${LOGFILE} 2>>${LOGFILE}
git push origin gh-pages >>${LOGFILE} 2>>${LOGFILE}

print_log "Documentation published successfully!\n"

cd ..
# Cleanup
rm -rf ${UNIQUEID}_pages
