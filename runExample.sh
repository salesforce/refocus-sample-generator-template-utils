#!/bin/bash

# Usage:
# ./runExample -t transformExample
# ./runExample -c connectionExample
# ./runExample all

dir=reserved-project-name-for-automated-tests
function runExample {
  rm -rf $dir
  sgtu-init $dir $1 $2
  cd $dir
  npm run test
  if [ $? != 0 ]; then exit; fi
  cd ..
  rm -rf $dir
}

if [ $1 == all ]
then
  for example in `ls examples/transform`
    do runExample -t $example
  done
  for example in `ls examples/connection`
    do runExample -c $example
  done
else
  runExample $1 $2
fi
