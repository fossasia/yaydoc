#!/bin/bash

git config --global user.name "Bot"
git config --global user.email "noreply+bot@example.com"
git clone --quiet $GITURL gh-pages
cd gh-pages
git fetch
if ! git checkout gh-pages ; then
  git checkout -b gh-pages
fi
git rm -rfq ./*
cp -a ../_build/html/. ./
if [[ -z "${DOCURL}" ]]; then
    echo -e "DOCURL not set. Using default github pages URL"
else
    echo $DOCURL > CNAME
fi
git add -f .
git commit -q -m "[Auto] Update Built Docs ($(date +%Y-%m-%d.%H:%M:%S))"
git push origin gh-pages
cd ../../
rm -rf yaydocclone
rm -rf yaydoctemp
deactivate
rm -- "$0"
