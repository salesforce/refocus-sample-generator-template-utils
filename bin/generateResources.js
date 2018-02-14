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
.option('-c, --connection <exampleName>', 'The name of the connection example to use')
.action(name => projectName = name)
.parse(process.argv);

const { transform, connection } = commander;
const projectText = `initializing project "${projectName}"`;
const transformText = transform ? ` with transform example "${transform}"` : '';
const andWith = transform && connection ? 'and' : 'with';
const connectionText = connection ? ` ${andWith} connection example "${connection}"` : '';

console.log(projectText + transformText + connectionText + ':');

rgu.createDir(projectName);
rgu.copyPrototype(transform, connection);
rgu.copyPackages();
rgu.setupPackageJson();
const packageInfo = rgu.getPackageInfo();
rgu.createTemplateJson(packageInfo);
rgu.createReadme(packageInfo);
console.log(`Done generating resources (${Date.now() - startTime}ms)`);
