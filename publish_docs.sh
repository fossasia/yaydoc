#!/bin/bash
#
# Publish the Sphinx generated documentation to Gihub Pages
#
# Environment Variables:
# $DOCURL - Custom URL where the documentation would be published.

git config --global user.name "Yaydoc Bot"
git config --global user.email "noreply+bot@example.com"

git clone --quiet $SSH_REPO gh-pages
cd gh-pages

# Create gh-pages branch if it doesn't exist
git fetch
if ! git checkout gh-pages ; then
  git checkout -b gh-pages
fi

# Overwrite files in the branch
git rm -rfq ./*
cp -a ../_build/html/. ./

# Enable publishing documentation to custom URL
if [[ -z "${DOCURL}" ]]; then
  echo -e "DOCURL not set. Using default github pages URL"
else
  echo $DOCURL > CNAME
fi

# Publish documentation
git add -f .
git commit -q -m "[Auto] Update Built Docs ($(date +%Y-%m-%d.%H:%M:%S))"
git push origin gh-pages

# Cleanup
cd $ROOT_DIR
rm -rf $BUILD_DIR
deactivate
rm -- "$0"
