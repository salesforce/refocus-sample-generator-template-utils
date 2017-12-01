#! /usr/bin/env node

/**
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * bin/generateResources.js
 */
const rgu = require('../src/resourceGenUtils');
const startTime = Date.now();
const commander = require('commander');
let projectName;

commander
.arguments('<projectName>')
.option('-t, --transform <exampleName>', 'The name of the transform ' +
  'example to use')
.option('-u, --toUrl <exampleName>', 'The name of the toUrl example to use')
.action(name => projectName = name)
.parse(process.argv);

const { transform, toUrl } = commander;
const projectText = `initializing project "${projectName}"`;
const transformText = transform ? ` with transform example "${transform}"`: '';
const andWith = transform && toUrl ? 'and' : 'with';
const toUrlText = toUrl ? ` ${andWith} toUrl example "${toUrl}"`: '';


console.log(projectText + transformText + toUrlText + ':');

rgu.createDir(projectName)
.then(() => rgu.copyPrototype(transform, toUrl))
.then(() => rgu.copyPackages())
.then(() => rgu.setupPackageJson())
.then(() => rgu.getPackageInfo())
.then((packageInfo) => {
  rgu.createTemplateJson(packageInfo);
  rgu.createReadme(packageInfo);
})
.then(() => console.log(`Done generating resources (${Date.now() - startTime}ms)`))
.catch((err) => console.log(`ERROR: ${err.message}`));
