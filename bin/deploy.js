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
.arguments('<templateFile> <refocusUrl> <refocusToken>')
.option('--isPublished <true|false>', 'set isPublished to true|false')
.parse(process.argv);

if (commander.args.length < 3) {
  console.error('\nError: <templateFile> <refocusUrl> <refocusToken> args are required.\n');
  process.exit(1);
}

if (!commander.hasOwnProperty('isPublished')) {
  console.error('\nError: --isPublished <true|false> is required.\n');
  process.exit(1);
}

if (!['true', 'false'].includes(commander.isPublished.toLowerCase())) {
  console.error('\nError: --isPublished <true|false> is required.\n');
  process.exit(1);
}

const [templateFile, refocusUrl, refocusToken] = commander.args;
const isPublished = commander.isPublished.toLowerCase() === 'true';
console.log(`Deploying ${templateFile} to ${refocusUrl} with ` +
  `isPublished=${isPublished}...`);

u.deploy(templateFile, refocusUrl, refocusToken, isPublished)
.then(() => console.log(`Done deploying ${templateFile} to ${refocusUrl} ` +
  ` (${Date.now() - startTime}ms)`))
.catch((err) => console.error(err));
