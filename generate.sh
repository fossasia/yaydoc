mkdir temp

#cp rep/doc temp/
cd temp
sphinx-quickstart -q -v 1 -a sch00lb0y -p yay
rm index.rst
cd ..
git clone git@github.com:sch00lb0y/tempCheck.git
cp -a tempCheck/doc/. temp/
cd temp
make html
git clone --quiet --branch=gh-pages git@github.com:sch00lb0y/tempCheck.git gh-pages
cd gh-pages
git rm -rf ./*
cp -a ../_build/html/. ./
git add -f .

git commit -m "gh-pages push"
git push -fq origin gh-pages
cd ..
cd ..
rm -r temp
rm -r tempCheck
