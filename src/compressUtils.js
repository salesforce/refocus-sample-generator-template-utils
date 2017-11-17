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
    drop_console: true,
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

const buildToUrl = (dir = cwd) => fs.readJson(path.resolve(dir, `${name}.json`))
  .then((contents) => contents.hasOwnProperty('connection') &&
    contents.connection.hasOwnProperty('url') ?
  Promise.reject('SGT already has connection.url') : true)
  .then(() => compressToUrl(dir))
  .then((code) => updateTemplateToUrl(code));

const compressToUrl = (dir = cwd) => {
  const toUrlPath = path.resolve(dir, 'toUrl', 'toUrl.js');
  const toUrlExports = require(toUrlPath);
  const toUrlString = toUrlExports.toUrl.toString();
  return compress(toUrlString);
};

const doCompress = (code) => UglifyJS.minify(code, uglifyOpts).code;

const doUpdateTemplate = (attr, code, pathToFile) => fs.readJson(pathToFile)
  .then((contents) => {
    contents[attr] = code;
    return contents;
  })
  .then((contents) => fs.writeJson(pathToFile, contents, { spaces: 2 }));

const updateTemplateToUrl = (code, dir = cwd) => {
  const f = path.resolve(dir, `${name}.json`);
  fs.readJson(f)
  .then((contents) => {
    if (!contents.hasOwnProperty('connection')) {
      contents.connection = {};
    };

    contents.connection.toUrl = code;
    return contents;
  })
  .then((contents) => fs.writeJson(f, contents, { spaces: 2 }));
};

const buildTransform = (dir = cwd) => {
  const transformPath = path.resolve(dir, 'transform', 'transform.js');
  const transformExports = require(transformPath);
  const transformBulk = transformExports.transformBulk;
  const transformBySubject = transformExports.transformBySubject;
  const errorHandlers = transformExports.errorHandlers
    ? Object.keys(transformExports.errorHandlers) : [];
  const helpers = transformExports.helpers;
  const transformObj = { errorHandlers: {}, };
  let bulk;

  if (transformBulk && transformBySubject) {
    throw new Error('Only one transform function can be defined. Comment ' +
      'out the other one.');
  }

  if (transformBulk) {
    let code = transformBulk.toString();
    bulk = isBulk(code);
    if (bulk) {
      transformObj.transform = compress(code, helpers);
    } else {
      throw new Error('Invalid function signature: "transformBulk" must ' +
        'have "subjects" param.');
    }
  }

  if (transformBySubject) {
    let code = transformBySubject.toString();
    bulk = isBulk(code);
    if (!bulk) {
      transformObj.transform = compress(code, helpers);
    } else {
      throw new Error('Invalid function signature: "transformBySubject" ' +
        'must have "subject" param.');
    }
  }

  errorHandlers.forEach((functionName) => {
    let code = transformExports.errorHandlers[functionName].toString();
    if (bulk === undefined) bulk = isBulk(code);
    if (isBulk(code) === bulk) {
      transformObj.errorHandlers[functionName] =
        compress(code, helpers);
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

function compress(code, helpers = {}) {
  // For default functions of the form:
  //   transformBulk(ctx, aspects, ...) {...}
  // Make sure code is a valid function declaration so uglify won't drop it.
  if (!code.startsWith('function')) {
    code = code.replace(/^/, 'function ');
  }

  // For error handler functions of the form:
  //   '404': function(ctx, aspects, ...) {...}
  // Make sure code is a valid function declaration so uglify won't drop it.
  // The "placeholder" name will be removed on minify.
  if (code.startsWith('function')) {
    code = code.replace(/^function\s*\(/, 'function placeholder(');
  }

  // Attach all helpers. Unused helpers will be removed on minify.
  Object.keys(helpers).forEach((key) => {
    let helperCode = helpers[key].toString();

    // For helpers of the form:
    //   square(x) {...}
    // Make sure code is a valid function declaration so uglify won't drop it.
    if (!helperCode.startsWith('function')) {
      helperCode = helperCode.replace(/^/, 'function ');
    }

    // Concatenate the helpers directly on to the end of the function string.
    // Uglify will rename and reformat it, or drop it if it isn't used.
    code = code.replace(/}$/, ';' + helperCode + '}');
  });

  // Minify code.
  code = UglifyJS.minify(code, uglifyOpts).code;

  // Extract the function body so it can be executed directly.
  code = code.replace(/^.*?{/, '').replace(/}$/, '');
  return code;
}

module.exports = {
  buildToUrl,
  buildTransform,
  compressToUrl,
  doCompress,
  doUpdateTemplate,
  updateTemplateToUrl,
};
