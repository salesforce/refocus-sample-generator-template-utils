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
const usage = '\nUsage:\n' +
  '  sgtu-deploy TEMPLATE_FILE REFOCUS_URL REFOCUS_TOKEN\n\n' +
  '  Note: TEMPLATE_FILE, REFOCUS_URL and REFOCUS_TOKEN are all required.\n';
const startTime = Date.now();
const templateFile = process.argv[2];
const refocusUrl = process.argv[3];
const refocusToken = process.argv[4];

if (process.argv.length < 5) {
  console.error(usage);
  process.exit(1);
}

u.deploy(templateFile, refocusUrl, refocusToken)
.then(() => console.log(`Done deploying ${templateFile} to ${refocusUrl} ` +
  ` (${Date.now() - startTime}ms)`))
.catch((err) => console.error(err));

// const t = {
//   transform: '',
//   name: 'aa1',
//   version: '1.0.0',
//   connection: {
//     method: 'GET',
//     url: 'http://a.c.com',
//   },
//   author: {
//     name: 'asd',
//     // email: 'asd@asf.com',
//     // url: 'http://asd.asd.com',
//   },
// };
// u.deploy(t, refocusUrl, refocusToken)
// .then(() => console.log(`Done deploying ${templateFile} to ${refocusUrl} ` +
//   ` (${Date.now() - startTime}ms)`))
// .catch((err) => console.error(err));
