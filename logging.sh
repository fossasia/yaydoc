#!/bin/bash
# Logging bash output to a log file

function print_log {
  echo -e ${1} | tee -a ${LOGFILE}
}

function print_danger {
  >&2 echo -e ${1} | tee -a ${LOGFILE}
}
