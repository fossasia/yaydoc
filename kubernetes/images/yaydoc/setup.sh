#!/bin/bash
git clone ${REPOSITORY} yaydoc
cd yaydoc
git checkout ${BRANCH}

if [ -v COMMIT_HASH ]; then
    git reset --hard ${COMMIT_HASH}
fi

npm install --no-shrinkwrap

pip install -r requirements.txt

wget -qO- https://cli-assets.heroku.com/install-ubuntu.sh | sh
