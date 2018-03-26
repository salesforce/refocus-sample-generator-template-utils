#!/bin/bash

# Usage:
# ./runExample -t transformExample
# ./runExample -c connectionExample
# ./runExample all

# This should only be called from the sgt-utils project directory

newProject=reserved-project-name-for-automated-tests
baseDir=`pwd`
function runExample {
  # need to go one dir up from the sgt-utils project to make sure the copy works
  # outside the scope of its node modules
  cd ..
  rm -rf $newProject
  sgtu-init $newProject $1 $2
  cd $newProject
  npm run test
  if [ $? != 0 ]; then exit; fi
  cd ..
  cd $baseDir
  rm -rf $newProject
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
