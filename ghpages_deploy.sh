#!/bin/bash
#
# Publish the Sphinx generated documentation to Gihub Pages
#
# Environment Variables:
# $DOCURL - Custom URL where the documentation would be published.

while getopts e:i:n:o:r: option
do
  case "${option}"
  in
  e) EMAIL=${OPTARG};;
  i) UNIQUE_ID=${OPTARG};;
  n) USERNAME=${OPTARG};;
  o) OAUTH_TOKEN=${OPTARG};;
  r) REPONAME=${OPTARG};;
  esac
done

git config --global user.name "Yaydoc Bot"
git config --global user.email "noreply+bot@example.com"

GIT_HTTPS_URL=https://$USERNAME:$OAUTH_TOKEN@github.com/$USERNAME/$REPONAME.git
cd temp/${EMAIL}
git clone --quiet $GIT_HTTPS_URL ${UNIQUE_ID}_pages


if [ $? -ne 0 ]; then
  echo -e "Failed to clone gh-pages.\n"
  clean
  exit 3
fi

echo -e "Cloned successfully! \n"

cd ${UNIQUE_ID}_pages

# Create gh-pages branch if it doesn't exist
git fetch
if ! git checkout gh-pages ; then
  git checkout -b gh-pages
fi

# Overwrite files in the branch
git rm -rfq ./*
cp -a ../${UNIQUE_ID}_preview/. ./

echo -e "Overwrite successfully \n"

# Enable publishing documentation to custom URL
if [ -z "$DOCURL" ]; then
  echo -e "DOCURL not set. Using default github pages URL"
else
  echo -e "DOCURL set."
  echo $DOCURL > CNAME
fi

# Publish documentation
git add -f .
git commit -q -m "[Auto] Update Built Docs ($(date +%Y-%m-%d.%H:%M:%S))"
git push origin gh-pages

echo -e "github pages pushed successfully!\n"

cd ..
# Cleanup
rm -rf ${UNIQUE_ID}_pages
