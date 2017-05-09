mkdir temp

#cp rep/doc temp/

cd temp
sphinx-quickstart -q -v $VERSION -a $AUTHOR -p $PROJECTNAME
rm index.rst
cd ..
cp -a $DOCPATH. temp/
cd temp
make html
git config --global user.email $EMAIL
git config --global user.name $USERNAME

ssh-keyscan github.com >> ~/.ssh/known_hosts

git clone --quiet --branch=gh-pages $GITURL gh-pages
chmod -R u+x gh-pages
cd gh-pages
git rm -rf ./*
cp -a ../_build/html/. ./
git add -f .

git commit -m "gh-pages push"
git push -fq origin gh-pages
cd ..
cd ..
chmod -R u+x temp
rm -rf temp

