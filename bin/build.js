#! /usr/bin/env node

/**
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * bin/build.js
 */
const cu = require('../src/compressUtils');
const startTime = Date.now();

cu.buildTransform()
.then(() => {
  console.log(`Done building transform (${Date.now() - startTime}ms)`)
  return cu.buildToUrl()
})
.then(() => console.log(`Done building toUrl (${Date.now() - startTime}ms)`))
.catch((err) => console.error(err));

