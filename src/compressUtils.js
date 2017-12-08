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
const name = path.basename(cwd);
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

function buildToUrl(dir = cwd) {
  const toUrlPath = path.resolve(dir, 'toUrl', 'toUrl.js');
  const toUrlExports = require(toUrlPath);
  const toUrlString = toUrlExports.toUrl.toString();
  const ctxDef = toUrlExports.contextDefinition || {};
  const helpers = toUrlExports.helpers || {};

  validateCtxDef(ctxDef);
  validateCtxUsages(toUrlString, ctxDef);
  const code = compress(toUrlString, helpers);

  const f = path.resolve(dir, `${name}.json`);
  return fs.readJson(f)
  .then((contents) => {
    if (!contents.hasOwnProperty('connection')) {
      contents.connection = {};
    }

    if (contents.connection.hasOwnProperty('url')) {
      Promise.reject('SGT already has connection.url');
    }

    contents.connection.toUrl = code;
    Object.assign(contents.contextDefinition, ctxDef);
    return contents;
  })
  .then((contents) => fs.writeJson(f, contents, { spaces: 2 }));
}

function buildTransform(dir = cwd) {
  const transformPath = path.resolve(dir, 'transform', 'transform.js');
  const transformExports = require(transformPath);
  const transformBulk = transformExports.transformBulk;
  const transformBySubject = transformExports.transformBySubject;
  const errorHandlers = transformExports.errorHandlers
    ? Object.keys(transformExports.errorHandlers) : [];
  const ctxDef = transformExports.contextDefinition || {};
  const helpers = transformExports.helpers || {};
  const transformObj = { errorHandlers: {}, };
  let bulk;

  validateCtxDef(ctxDef);

  if (transformBulk && transformBySubject) {
    throw new Error('Only one transform function can be defined. Comment ' +
      'out the other one.');
  }

  if (transformBulk) {
    let code = transformBulk.toString();
    bulk = isBulk(code);
    if (bulk) {
      validateCtxUsages(code, ctxDef);
      transformObj.default = compress(code, helpers);
    } else {
      throw new Error('Invalid function signature: "transformBulk" must ' +
        'have "subjects" param.');
    }
  }

  if (transformBySubject) {
    let code = transformBySubject.toString();
    bulk = isBulk(code);
    if (!bulk) {
      validateCtxUsages(code, ctxDef);
      transformObj.default = compress(code, helpers);
    } else {
      throw new Error('Invalid function signature: "transformBySubject" ' +
        'must have "subject" param.');
    }
  }

  errorHandlers.forEach((functionName) => {
    let code = transformExports.errorHandlers[functionName].toString();
    if (bulk === undefined) bulk = isBulk(code);
    if (isBulk(code) === bulk) {
      validateCtxUsages(code, ctxDef);
      transformObj.errorHandlers[functionName] = compress(code, helpers);
    } else {
      throw new Error(`Invalid function signature: "${functionName}" must ` +
        'have the same arguments as the corresponding "transformXXXXXX" ' +
        'function.');
    }
  });

  // return promise to update template file
  const f = path.resolve(dir, `${name}.json`);
  return fs.readJson(f)
  .then((contents) => {
    contents.transform = transformObj;
    contents.connection.bulk = bulk;
    Object.assign(contents.contextDefinition, ctxDef);
    return contents;
  })
  .then((contents) => fs.writeJson(f, contents, { spaces: 2 }));
};

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
 * Returns the minified code along with the helpers.
 * @param  {String} code -  Code to be minified
 * @param  {Object} helpers - Helper functions used by the code.
 * @returns {String} as minified code
 */
function compress(code, helpers) {
  /*
   * For default functions of the form:
   *   transformBulk(ctx, aspects, ...) {...}
   * Make sure code is a valid function declaration so uglify won't drop it.
   */
  if (!code.startsWith('function')) {
    code = code.replace(/^/, 'function ');
  }

  /*
   * For error handler functions of the form:
   *  '404': function(ctx, aspects, ...) {...}
   * Make sure code is a valid function declaration so uglify won't drop it.
   * The "placeholder" name will be removed on minify.
   */
  if (code.startsWith('function')) {
    code = code.replace(/^function\s*\(/, 'function placeholder(');
  }

  // Attach all helpers. Unused helpers will be removed on minify.
  Object.keys(helpers).forEach((key) => {
    let helperCode = helpers[key].toString();

    /*
     * For helpers of the form:
     *   square(x) {...}
     * Make sure code is a valid function declaration so uglify won't drop it.
     */
    if (!helperCode.startsWith('function')) {
      helperCode = helperCode.replace(/^/, 'function ');
    }

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
 * @throws {Error} if there is an invalid use of a context variable.
 */
function validateCtxUsages(code, ctxDef) {
  let match;
  let ctxVars = [];
  const re1 = /\bctx\s*\.\s*(\w+)/g; // match ctx.var
  const re2 = /\bctx\s*\[\s*(['"`])?(.*)\1\s*\]/g; // match ctx[var]
  while (match = re1.exec(code)) ctxVars.push(match[1]);
  while (match = re2.exec(code)) ctxVars.push(match[2]);

  ctxVars.forEach((key) => {
    if (!ctxDef[key]) {
      throw new Error(
        `context variable "${key}" used in transform is not defined in ` +
        `contextDefinition`
      );
    }
  });
}

/**
 * Make sure the context variables defined in the contextDefinition are valid.
 * @param  {Object} ctxDef - The contextDefinition object.
 * @throws {Error} if any of the variables are invalid.
 */
function validateCtxDef(ctxDef) {
  Object.keys(ctxDef).forEach((key) => {
    if (!ctxDef[key].description) {
      throw new Error(`contextDefinition.${key}: description required`);
    }

    if (ctxDef[key].required && ctxDef[key].default) {
      throw new Error(
        `contextDefinition.${key}: default not needed if required is true`
      );
    }
  });
}

/**
 * Make sure the contextDefinitions in transform and toUrl do not conflict
 * @throws {Error} if there is a conflict
 */
function checkConflictingCtxDefs(dir = cwd) {
  const transformPath = path.resolve(dir, 'transform', 'transform.js');
  const toUrlPath = path.resolve(dir, 'toUrl', 'toUrl.js');
  const transformCtxDef = require(transformPath).contextDefinition;
  const toUrlCtxDef = require(toUrlPath).contextDefinition;
  Object.keys(transformCtxDef).forEach((key) => {
    const transformCtxVar = transformCtxDef[key];
    const toUrlCtxVar = toUrlCtxDef[key];
    if (transformCtxVar && toUrlCtxVar) {
      if (
        transformCtxVar.description !== toUrlCtxVar.description
        || transformCtxVar.required !== toUrlCtxVar.required
        || transformCtxVar.default !== toUrlCtxVar.default //TODO object?
      ) {
        throw new Error(
          `contextDefinition.${key}: conflicting definitions in ` +
          `transform.js and toUrl.js`
        );
      }
    }
  });
  return Promise.resolve();
}

module.exports = {
  buildToUrl,
  buildTransform,
  checkConflictingCtxDefs,
};
