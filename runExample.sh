#!/bin/bash

# Usage:
# ./runExample -t transformExample
# ./runExample -u toUrlExample
# ./runExample all

dir=test-project
function runExample {
  rm -rf $dir
  sgtu-init $dir $1 $2
  cd $dir
  npm run test
  cd ..
}

if [ $1 == all ]
then
  for example in `ls examples/transform`
    do runExample -t $example
  done
  for example in `ls examples/toUrl`
    do runExample -u $example
  done
else
  runExample $1 $2
fi
