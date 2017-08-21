#!/bin/bash
export DIR=${BASH_SOURCE%/*}

if [ "$1" = "delete" ]; then
    echo "Clearing the cluster."
    if [ "$2" = "all" ]; then
        kubectl delete -f ${DIR}/yamls/nginx/00-namespace.yml
    fi
    kubectl delete -f ${DIR}/yamls/web/00-namespace.yml
    kubectl delete -f ${DIR}/yamls/mongo/00-namespace.yml
    echo "Done. The project was removed from the cluster."
elif [ "$1" = "create" ]; then
    echo "Deploying the project to kubernetes cluster"
    if [ "$2" = "all" ]; then
        # Start nginx deployment, ingress & service
        kubectl create -R -f ${DIR}/yamls/nginx
    fi
    kubectl create -R -f ${DIR}/yamls/mongo
    # Create web namespace
    kubectl create -R -f ${DIR}/yamls/web
    # Create API server deployment and service
    kubectl create -R -f ${DIR}/yamls/yaydoc
    echo "Waiting for server to start up. ~30s."
    sleep 30
    echo "Done. The project was deployed to kubernetes. :)"
fi
