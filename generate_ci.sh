#!/bin/bash

# Cleanup
function clean() {
  cd $ROOT_DIR
  rm -rf $BUILD_DIR
  rm -rf $BASE
  deactivate
  rm -- "$0"
}

# Generate documentation
alias exit=return
source <(curl -s https://raw.githubusercontent.com/fossasia/yaydoc/unify/generate.sh)
GENERATE_STATUS=$?
unalias exit
if [ $GENERATE_STATUS -ne 0 ]; then
  clean
  exit $GENERATE_STATUS
fi

# Publish generated documentation to ghpages branch
source <(curl -s https://raw.githubusercontent.com/fossasia/yaydoc/master/publish_docs.sh)
