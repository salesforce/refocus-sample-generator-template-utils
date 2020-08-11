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
const rgu = require('../src/resourceGenUtils');
const cu = require('../src/compressUtils');
const startTime = Date.now();

cu.checkConflictingCtxDefs();
const packageInfo = rgu.getPackageInfo();
rgu.createTemplateJson(packageInfo);
console.log(`Done creating template (${Date.now() - startTime}ms)`);
cu.buildTransform();
console.log(`Done building transform (${Date.now() - startTime}ms)`);
cu.buildConnection();
console.log(`Done building connection (${Date.now() - startTime}ms)`);
