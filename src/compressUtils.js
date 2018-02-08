/**
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * src/compressUtils.js
 *
 * Compresses the transform code and inserts it into the template json.
 */
const path = require('path');
const fs = require('fs-extra');
const UglifyJS = require('uglify-es');
const cwd = process.cwd();
const uglifyOpts = {
  compress: {
    dead_code: true,
    drop_debugger: true,
    conditionals: true,
    comparisons: true,
    evaluate: true,
    booleans: true,
    typeofs: true,
    loops: true,
    unused: true,
    toplevel: false,
    if_return: true,
    inline: true,
    join_vars: true,
    cascade: true,
    collapse_vars: true,
    reduce_vars: true,
    warnings: true,
    negate_iife: true,
    drop_console: false,
    passes: 5,
    ecma: 6,
  },
  mangle: {
    reserved: ['ctx', 'aspects', 'subjects', 'aspect', 'subject', 'res'],
  },
  output: {
    beautify: false,
    ecma: 6,
    quote_style: 1,
  },
  ecma: 6,
  warnings: true,
};

function buildConnection(dir = cwd) {
  const name = path.basename(dir);
  const connectionPath = path.resolve(dir, 'connection', 'connection.js');
  const connectionExports = require(connectionPath);
  const ctxDef = connectionExports.contextDefinition;

  const f = path.resolve(dir, `${name}.json`);
  return fs.readJson(f)
  .then((contents) => {
    if (!contents.connection) contents.connection = {};
    if (!contents.contextDefinition) contents.contextDefinition = {};
    doBuildConnection(connectionExports, contents.connection);
    Object.assign(contents.contextDefinition, ctxDef);
    return contents;
  })
  .then((contents) => fs.writeJson(f, contents, { spaces: 2 }));
}

function doBuildConnection(connectionExports, connectionObj) {
  const url = connectionExports.url;
  const toUrl = connectionExports.toUrl;
  const headers = connectionExports.headers;
  const ctxDef = connectionExports.contextDefinition || {};
  const helpers = connectionExports.helpers || {};
  let toUrlString;

  if (!url && !toUrl) {
    throw new Error('You must define either "url" or "toUrl".');
  } else if (url && toUrl) {
    throw new Error('"url" and "toUrl" cannot both be defined. Remove one.');
  }

  validateCtxDef(ctxDef);

  if (url) {
    if (typeof url !== 'string') {
      throw new Error('"url" must be a string.');
    }

    connectionObj.url = url;
    if (connectionObj.hasOwnProperty('toUrl')) {
      delete connectionObj.toUrl;
    }
  }

  if (toUrl) {
    if (typeof toUrl !== 'function') {
      throw new Error('"toUrl" must be a function.');
    }

    toUrlString = toUrl.toString();
    validateCtxUsages(toUrlString, ctxDef, 'toUrl');
    toUrlString = compress(toUrlString, helpers);

    connectionObj.toUrl = toUrlString;
    if (connectionObj.hasOwnProperty('url')) {
      delete connectionObj.url;
    }
  }

  if (headers) {
    connectionObj.headers = headers;
  }
}

function buildTransform(dir = cwd) {
  const name = path.basename(dir);
  const transformPath = path.resolve(dir, 'transform', 'transform.js');
  const transformExports = require(transformPath);
  const ctxDef = transformExports.contextDefinition;
  const { transformObj, bulk } = doBuildTransform(transformExports);

  // return promise to update template file
  const f = path.resolve(dir, `${name}.json`);
  return fs.readJson(f)
  .then((contents) => {
    if (!contents.connection) contents.connection = {};
    if (!contents.contextDefinition) contents.contextDefinition = {};
    contents.transform = transformObj;
    contents.connection.bulk = bulk;
    Object.assign(contents.contextDefinition, ctxDef);
    return contents;
  })
  .then((contents) => fs.writeJson(f, contents, { spaces: 2 }));
}

function doBuildTransform(transformExports) {
  const transformBulk = transformExports.transformBulk;
  const transformBySubject = transformExports.transformBySubject;
  const errorHandlers = transformExports.errorHandlers
    ? Object.keys(transformExports.errorHandlers) : [];
  const ctxDef = transformExports.contextDefinition || {};
  const helpers = transformExports.helpers || {};
  const transformObj = { errorHandlers: {} };
  let bulk;

  validateCtxDef(ctxDef);

  if (transformBulk && transformBySubject) {
    throw new Error(
      'Only one transform function can be defined. Comment out the other one.'
    );
  }

  if (transformBulk) {
    if (typeof transformBulk !== 'function') {
      throw new Error('transformBulk must be a function');
    }

    let code = transformBulk.toString();
    bulk = isBulk(code);
    if (bulk) {
      validateCtxUsages(code, ctxDef, 'transformBulk');
      transformObj.default = compress(code, helpers);
    } else {
      throw new Error(
        'Invalid function signature: "transformBulk" must have "subjects" param'
      );
    }
  }

  if (transformBySubject) {
    if (typeof transformBySubject !== 'function') {
      throw new Error('transformBySubject must be a function');
    }

    let code = transformBySubject.toString();
    bulk = isBulk(code);
    if (!bulk) {
      validateCtxUsages(code, ctxDef, 'transformBySubject');
      transformObj.default = compress(code, helpers);
    } else {
      throw new Error(
        'Invalid function signature: "transformBySubject" must have ' +
        '"subject" param.'
      );
    }
  }

  errorHandlers.forEach((functionName) => {
    const handler = transformExports.errorHandlers[functionName];
    if (typeof handler !== 'function') {
      throw new Error('errorHandlers must be functions');
    }

    let code = handler.toString();
    if (bulk === undefined) bulk = isBulk(code);
    if (isBulk(code) === bulk) {
      validateCtxUsages(code, ctxDef, functionName);
      transformObj.errorHandlers[functionName] = compress(code, helpers);
    } else {
      throw new Error(
        `Invalid function signature: "${functionName}" must have the same ` +
        'arguments as the corresponding "transformXXXXXX" function.'
      );
    }
  });

  return {
    transformObj,
    bulk,
  };
}

function isBulk(code) {
  const args = code.match(/\(.*?\)/)[0];
  const subj = args.match(/\bsubjects?\b/)[0];
  if (subj === 'subjects') {
    return true;
  } else {
    return false;
  }
}

/**
 * Given a function string in one of the three forms that can be defined within
 * an object, standardizes it to a regular function declaration that can be
 * passed to Uglify.
 * @param  {String} code - a stringified function
 * @returns {String} standardized code
 */
function standardizeFunctionForm(code, funcName) {
  /*
   * For error handler functions of the form:
   *  '404': function(ctx, aspects, ...) {...}
   */
  if (code.startsWith('function')) {
    return code.replace(/^function\s*\(/, `function ${funcName}(`);
  }

  /*
   * For default or helper functions of the form:
   *   transformBulk(ctx, aspects, ...) {...}
   */
  else if (code.match(/^\w+\s*\(.*?\)/)) {
    return code.replace(/^/, 'function ');
  }

  /*
   * For arrow functions of the form:
   *   key: (ctx, aspects, ...) => {...}
   */
  else if (code.match(/^\(.*?\)\s*=>\s*\{/)) {
    code = code.replace(/\s*=>\s*/, ' ');
    return code.replace(/^/, `function ${funcName}`);
  }
}

/**
 * Returns the minified code along with the helpers.
 * @param  {String} code -  Code to be minified
 * @param  {Object} helpers - Helper functions used by the code.
 * @returns {String} as minified code
 */
function compress(code, helpers) {
  code = standardizeFunctionForm(code, 'transform');

  // Attach all helpers. Unused helpers will be removed on minify.
  Object.keys(helpers).forEach((key) => {
    if (typeof helpers[key] !== 'function') {
      throw new Error('helpers must be functions');
    }

    let helperCode = helpers[key].toString();
    helperCode = standardizeFunctionForm(helperCode, key);

    /*
     * Concatenate the helpers directly on to the end of the function string.
     * Uglify will rename and reformat it, or drop it if it isn't used.
     */
    code = code.replace(/}$/, ';' + helperCode + '}');
  });

  // Minify code.
  code = UglifyJS.minify(code, uglifyOpts).code;

  // Extract the function body so it can be executed directly.
  code = code.replace(/^.*?{/, '').replace(/}$/, '');
  return code;
}

/**
 * Make sure any context variables used by the function are defined in the
 * contextDefinition object.
 * @param  {String} code - The function to be checked.
 * @param  {Object} ctxDef - The contextDefinition object.
 * @param  {String} fName - The name of the function being checked.
 * @throws {Error} if there is an invalid use of a context variable.
 */
function validateCtxUsages(code, ctxDef, fName) {
  let match;
  let ctxVars = [];
  const re1 = /\bctx\s*\.\s*(\w+)/g; // match ctx.var
  const re2 = /\bctx\s*\[\s*(['"`])?(.*?)\1\s*\]/g; // match ctx[var]
  while (match = re1.exec(code)) ctxVars.push(match[1]);
  while (match = re2.exec(code)) ctxVars.push(match[2]);

  const undefinedKeys = [];
  ctxVars.forEach((key) => {
    if (!ctxDef[key]) {
      undefinedKeys.push(key);
    }
  });

  if (undefinedKeys.length === 1) {
    throw new Error(
      `context variable "${undefinedKeys[0]}" used in ${fName} is not ` +
      `defined in contextDefinition`
    );
  }

  if (undefinedKeys.length > 1) {
    throw new Error(
      `context variables [${undefinedKeys}] used in ${fName} are not ` +
      `defined in contextDefinition`
    );
  }
}

/**
 * Make sure the context variables defined in the contextDefinition are valid.
 * @param  {Object} ctxDef - The contextDefinition object.
 * @throws {Error} if any of the variables are invalid.
 */
function validateCtxDef(ctxDef) {
  if (typeof ctxDef !== 'object' || Array.isArray(ctxDef) || ctxDef === null) {
    throw new Error('contextDefinition must be an object');
  }

  Object.keys(ctxDef).forEach((key) => {
    const ctxItem = ctxDef[key];
    if (typeof ctxItem !== 'object' || Array.isArray(ctxItem) || ctxItem === null) {
      throw new Error('contextDefinition values must be objects');
    }

    if (!ctxItem.description) {
      throw new Error(`contextDefinition.${key}: description required`);
    }

    if (ctxItem.required && ctxItem.default) {
      throw new Error(
        `contextDefinition.${key}: default not needed if required is true`
      );
    }
  });
}

/**
 * Make sure the contextDefinitions in transform and connection do not conflict
 * @throws {Error} if there is a conflict
 */
function checkConflictingCtxDefs(dir = cwd) {
  const transformPath = path.resolve(dir, 'transform', 'transform.js');
  const connectionPath = path.resolve(dir, 'connection', 'connection.js');
  const transformCtxDef = require(transformPath).contextDefinition || {};
  const connectionCtxDef = require(connectionPath).contextDefinition || {};

  return new Promise((resolve, reject) => {
    Object.keys(transformCtxDef).forEach((key) => {
      const transformCtxVar = transformCtxDef[key];
      const connectionCtxVar = connectionCtxDef[key];
      if (transformCtxVar && connectionCtxVar) {
        if (
          transformCtxVar.description !== connectionCtxVar.description
          || transformCtxVar.required !== connectionCtxVar.required
          || transformCtxVar.default !== connectionCtxVar.default
        ) {
          reject(new Error(
            `contextDefinition.${key}: conflicting definitions in ` +
            `transform.js and connection.js`
          ));
        }
      }
    });
    resolve();
  });
}

module.exports = {
  buildConnection,
  doBuildConnection,
  buildTransform,
  doBuildTransform,
  checkConflictingCtxDefs,
  isBulk,
  compress,
  validateCtxUsages,
  validateCtxDef,
};
