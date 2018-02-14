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
let templateFile;
let refocusUrl;
let refocusToken;

commander
.arguments('<templateFile> <refocusUrl> <refocusToken>')
.action((tf, ru, rt) => {
  templateFile = tf;
  refocusUrl = ru;
  refocusToken = rt;
})
.parse(process.argv);

u.deploy(templateFile, refocusUrl, refocusToken)
.then(() => console.log(`Done deploying ${templateFile} to ${refocusUrl} ` +
  ` (${Date.now() - startTime}ms)`))
.catch((err) => console.error(err));
