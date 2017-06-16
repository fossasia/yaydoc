#!/bin/bash

if [ "$TRAVIS_BRANCH" == "master" ] && [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
    pip install --user virtualenv
    cp ./generate_ci.sh ./generate_copy.sh
    chmod +x ./generate_copy.sh
    ./generate_copy.sh
fi
