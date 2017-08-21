#!/usr/bin/env bash

export DEPLOY_BRANCH=${DEPLOY_BRANCH:-master}

if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_REPO_SLUG" != "fossasia/yaydoc" -o  "$TRAVIS_BRANCH" != "$DEPLOY_BRANCH" ]; then
    echo "Skip production deployment for a very good reason."
    exit 0
fi

export REPOSITORY="https://github.com/${TRAVIS_REPO_SLUG}.git"

sudo rm -f /usr/bin/git-credential-gcloud.sh
sudo rm -f /usr/bin/bq
sudo rm -f /usr/bin/gsutil
sudo rm -f /usr/bin/gcloud
rm -rf node_modules

curl https://sdk.cloud.google.com | bash;
source ~/.bashrc
gcloud components install kubectl

gcloud config set compute/zone us-central1-c
# Decrypt the credentials we added to the repo using the key we added with the Travis command line tool
openssl aes-256-cbc -K $encrypted_512fe31a4705_key -iv $encrypted_512fe31a4705_iv -in ./kubernetes/travis/yaydoc-ujjwal-7b7e19a433b1.json.enc -out yaydoc-ujjwal-7b7e19a433b1.json -d
gcloud auth activate-service-account --key-file yaydoc-ujjwal-7b7e19a433b1.json
export GOOGLE_APPLICATION_CREDENTIALS=$(pwd)/yaydoc-ujjwal-7b7e19a433b1.json

gcloud config set project yaydoc-702
gcloud container clusters get-credentials yaydoc-cluster
cd kubernetes/images/yaydoc
docker build --build-arg COMMIT_HASH=$TRAVIS_COMMIT --build-arg BRANCH=$DEPLOY_BRANCH --build-arg REPOSITORY=$REPOSITORY --no-cache -t ujjwalbhardwaj/yaydoc:$TRAVIS_COMMIT .
docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker tag ujjwalbhardwaj/yaydoc:$TRAVIS_COMMIT ujjwalbhardwaj/yaydoc:latest
docker push ujjwalbhardwaj/yaydoc
kubectl set image deployment/yaydoc --namespace=web yaydoc=ujjwalbhardwaj/yaydoc:$TRAVIS_COMMIT
rm -rf $GOOGLE_APPLICATION_CREDENTIALS
