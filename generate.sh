mkdir temp

#cp rep/doc temp/
cd temp
sphinx-quickstart -q -v 1 -a sch00lb0y -p yay
rm index.rst
cd ..
cp -a doc/. temp/
cd temp
make html
git config --global user.email "rbalajis25@gmail.com"
git config --global user.name "sch00lb0y"

ssh-keyscan github.com >> ~/.ssh/known_hosts

git clone --quiet --branch=gh-pages git@github.com:sch00lb0y/tempCheck.git gh-pages
chmod u+x gh-pages
cd gh-pages
git rm -rf ./*
cp -a ../_build/html/. ./
git add -f .

git commit -m "gh-pages push"
git push -fq origin gh-pages
cd ..
cd ..
rm -r temp
