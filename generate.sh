mkdir temp
cd temp
sphinx-quickstart -q -v $VERSION -a $AUTHOR -p $PROJECTNAME
rm index.rst
cd ..
cp -a $DOCPATH. temp/
cd temp
make html
git config --global user.name "Bot"
git config --global user.email "noreply+bot@example.com"
git clone --quiet --branch=gh-pages $GITURL gh-pages
cd gh-pages
git rm -rf ./*
cp -a ../_build/html/. ./
git add -f .
git commit -m "[Auto] Update Built Docs ($(date +%Y-%m-%d.%H:%M:%S))"
git push origin gh-pages
cd ../../
rm -rf temp
