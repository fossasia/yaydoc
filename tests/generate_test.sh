#!/bin/bash


clean() {
  rm -rf yaydoctemp
  rm -rf temp
}


setUp() {
  alias exit=return
}


tearDown() {
  unset exit
  clean
}


testErrorOnSphinxQuickstart() (
  sphinx-quickstart() { return 1; }
  source ./generate.sh > /dev/null 2>&1
  assertEquals 1 $?
)


testErrorOnMake() (
  make() { return 1; }
  source ./generate.sh > /dev/null 2>&1
  assertEquals 2 $?
)


testErrorOnZip() (
  zip() { return 1; }
  source ./generate.sh > /dev/null 2>&1
  assertEquals 3 $?
)

# shellcheck disable=SC2034
{
export GITURL="https://github.com/fossasia/yaydoc.git"
export EMAIL="fossasia@gmail.com"
export UNIQUEID="qwertyuiopasdfghjklzxcvbnm"
}

. shunit2-2.1.6/src/shunit2
