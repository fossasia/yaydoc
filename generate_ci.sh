#!/bin/bash

# Cleanup
function clean() {
  cd $ROOT_DIR
  rm -rf $BUILD_DIR
  rm -rf $BASE
  if [ "$INVENV" == "false" ]; then
    deactivate
  fi
}

# Generate documentation
alias exit=return
source <(curl -s https://raw.githubusercontent.com/fossasia/yaydoc/master/generate.sh)
GENERATE_STATUS=$?
unalias exit
if [ $GENERATE_STATUS -ne 0 ]; then
  clean
  exit $GENERATE_STATUS
fi

# Publish generated documentation to ghpages branch
source <(curl -s https://raw.githubusercontent.com/fossasia/yaydoc/master/ghpages_deploy.sh)

# Publish generated documentation to heroku
if [ -n "$HEROKU_APP_NAME" ]; then
  source <(curl -s https://raw.githubusercontent.com/fossasia/yaydoc/master/heroku_deploy.sh)
fi

clean
