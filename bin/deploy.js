#! /usr/bin/env node

/**
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * bin/deploy.js
 */
const u = require('../src/deployUtils');
const startTime = Date.now();
const commander = require('commander');

commander
.arguments('<templateFile> <isPublished> <refocusUrl> <refocusToken>')
.parse(process.argv);

if (commander.args.length < 4) {
  console.error(
    '\nError: <templateFile> <isPublished=(true|false)> <refocusUrl>' +
    ' <refocusToken> args are required.\n'
  );
  process.exit(1);
}

let [templateFile, isPublished, refocusUrl, refocusToken] = commander.args;

if (!['isPublished=true', 'isPublished=false'].includes(isPublished)) {
  console.error('\nError: isPublished must be "isPublished=<true|false>".\n');
  process.exit(1);
}

isPublished = isPublished === 'isPublished=true';
console.log(`Deploying ${templateFile} to ${refocusUrl} with ` +
  `isPublished: ${isPublished}`);

u.deploy(templateFile, refocusUrl, refocusToken, isPublished)
.then(() => console.log(`Done deploying ${templateFile} to ${refocusUrl} ` +
  ` (${Date.now() - startTime}ms)`))
.catch((err) => console.error(err));
