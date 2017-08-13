#!/bin/bash

while getopts l:t:e:u: option
do
 case "${option}"
 in
 l) LOGIN=${OPTARG};;
 t) TOKEN=${OPTARG};;
 e) EMAIL=${OPTARG};;
 u) UNIQUEID=${OPTARG};;
 esac
done

export SURGE_LOGIN=${LOGIN}
export SURGE_TOKEN=${TOKEN}

./node_modules/.bin/surge --project temp/${EMAIL}/${UNIQUEID}_preview --domain ${UNIQUEID}.surge.sh
