/**
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * src/deployUtils.js
 *
 * Utilities for deploying a sample generator template to Refocus.
 */
const req = require('superagent');
const fs = require('fs-extra');
const path = '/v1/generatortemplates';
const cwd = process.cwd();

/**
 * Deploy a sample generator template to Refocus. This function takes either
 * a file path (string) or the json contents of a template file.
 *
 * @param {String|Object} template - The file path (string) or the contents of
 *  the template (json object)
 * @param {String} url - The Refocus url
 * @param {String} token - The Refocus token
 * @returns {Promise} which resolves to the http response from Refocus or an
 *  error
 */
function deploy(template, url, token) {
  if (typeof template === 'string') {
    return fs.readJson(template)
    .then((contents) => deployTemplate(contents, url, token));
  }

  return deployTemplate(template, url, token);
} // deploy

/**
 * Deploy a sample generator template to Refocus, passing in the json contents
 * of a template file.
 *
 * @param {String|Object} template - The json contents of the template
 * @param {String} url - The Refocus url
 * @param {String} token - The Refocus token
 * @returns {Promise} which resolves to the http response from Refocus or an
 *  error
 */
function deployTemplate(templateJson, url, token) {
  return req.post(`${url}${path}`)
    .send(templateJson)
    .set({
      Accept: 'application/json',
      Authorization: token,
    });
} // deployTemplate

module.exports = {
  deploy,
};
