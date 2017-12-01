/**
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * src/resourceGenUtils.js
 *
 * Utilities for generating project resources.
 */
const util = require('util');
const path = require('path');
const fs = require('fs-extra');
let cwd = process.cwd();
const validatePackageName = require('validate-npm-package-name');
const Promise = require('bluebird');
const execSync = require('child_process').execSync;
const devDependencies = require('../package.json').devDependencies;

/* Format of the README.md file */
const readme = '# %s\n\n' +
  '## Description\n\n%s\n\n' +
  '## Context Variables\n\n The following context variables may be ' +
  'specified by the Sample Generator and will be available to build the ' +
  'connection url, or as contexet data passed into the transform function ' +
  'and toUrl function:\n\nTODO\n\n' +
  '## Transform Algorithm\n\nTODO write a description of the transform ' +
  'algorithm\n';

/* Scripts to add to the new project's package.json */
const scriptsToAdd = {
  build: 'sgtu-build',
  deploy: 'sgtu-deploy',
  'template-init': 'sgtu-init',
  test: 'istanbul cover ./node_modules/mocha/bin/_mocha ' +
    '--report lcovonly -- -R dot transform/testTransform.js toUrl/testToUrl.js ',
  'test-connection': 'echo "test-connection"',
  'test-to-url': './node_modules/mocha/bin/_mocha ' +
    ' toUrl/testToUrl.js',
  'test-transform': './node_modules/mocha/bin/_mocha ' +
    ' transform/testTransform.js',
  validate: 'echo "validate"',
};

module.exports = {
  /**
   * Create a directory for the new project
   *
   * @param {String} projectName - the name of the project. Must be a valid npm
   *  package name.
   */
  createDir: (projectName) => {
    console.log('creating project directory...');
    const validate = validatePackageName(projectName);
    if (validate.validForNewPackages) {
      const dir = path.resolve(cwd, projectName);
      return fs.mkdir(dir).then(() => cwd = dir);
    } else if (validate.errors) {
      return Promise.reject(new Error(validate.errors[0]));
    } else if (validate.warnings) {
      return Promise.reject(new Error(validate.warnings[0]));
    }
  },

  /**
   * Copy the prototype directory to the specified location.
   * Copy transform and toUrl examples if specified
   *
   * @param {String} transformExample - the name of the transform example to
   *  be used.
   * @param {String} toUrlExample - the name of the toUrl example to be used.
   * @param {String} toDir - The destination directory. Defaults to
   *  process.cwd
   * @returns {Promise} which resolves to the response from the copy command,
   *  or an error.
   */
  copyPrototype: (transformExample, urlExample, toDir = cwd) => {
    console.log('copying files to new project...');
    let transformFromDir = path.resolve(__dirname, '../prototype/transform');
    let urlFromDir = path.resolve(__dirname, '../prototype/toUrl');
    const utilsFromDir = path.resolve(__dirname, '../prototype/utils');

    const transformToDir = path.resolve(toDir, 'transform');
    const urlToDir = path.resolve(toDir, 'toUrl');
    const utilsToDir = path.resolve(toDir, 'utils');

    if (transformExample) {
      transformFromDir = path.resolve(__dirname,
        `../examples/transform/${transformExample}`);
    }

    if (urlExample) {
      urlFromDir = path.resolve(__dirname, `../examples/toUrl/${urlExample}`);
    }

    return fs.copy(utilsFromDir, utilsToDir)
    .then(() => fs.copy(transformFromDir, transformToDir))
    .then(() => fs.copy(urlFromDir, urlToDir));
  },

  /**
   * Create a README.md in the specified location.
   *
   * @param {Object} packageInfo - The json contents of the new project's
   *  package.json.
   * @param {String} dir - The directory to write the new README.md file.
   *  Defaults to process.cwd.
   * @returns {Promise} which resolves to the response from the writeFile
   *  command, or an error.
   */
  createReadme: (packageInfo, dir = cwd) => {
    console.log('creating README...');
    return fs.writeFile(
      path.resolve(dir, 'README.md'),
      util.format(readme, packageInfo.name,
        packageInfo.description || 'A Refocus Sample Generator Template.'),
        'utf-8');
  },

  /**
   * Create the sample generator template json file in the specified location.
   *
   * @param {Object} packageInfo - The json contents of the new project's
   *  package.json.
   * @param {String} dir - The directory to write the new template file.
   *  Defaults to process.cwd.
   * @returns {Promise} which resolves to the response from the writeJson
   *  command, or an error.
   */
  createTemplateJson: (packageInfo, dir = cwd) => {
    const filename = `${packageInfo.name}.json`;
    console.log(`creating ${filename}...`);
    return fs.writeJson(
      path.resolve(dir, filename),
      {
        name: packageInfo.name,
        version: packageInfo.version,
        description: packageInfo.description,
        tags: packageInfo.keywords && Array.isArray(packageInfo.keywords) ?
          packageInfo.keywords.concat([packageInfo.name]) : [packageInfo.name],
        author: packageInfo.author,
        repository: packageInfo.repository,
        connection: {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        },
        contextDefinition: {},
        transform: '',
      },
      { spaces: 2 });
  },

  /**
   * Retrieves the contents of the package.json file in the specified
   * directory as a json object.
   *
   * @param {String} dir - The directory to find the package.json file.
   *  Defaults to process.cwd.
   * @returns {Promise} which resolves to json contents of the package.json
   *  file, or an error.
   */
  getPackageInfo: (dir = cwd) => fs.readJson(
    path.resolve(dir, 'package.json')),

  /**
   * Copies devDependencies from this project to the new project
   */
  copyPackages: () => {
    console.log('copying packages...');
    Object.keys(devDependencies).forEach((m) => {
      const fromDir = path.resolve(__dirname, '..', 'node_modules', m);
      const toDir = path.resolve(cwd, 'node_modules', m);
      fs.copySync(fromDir, toDir);
    });
  },

  /**
   * Initializes the package.json file, then adds scripts and dependencies.
   *
   * @param {String} dir - The directory to find the package.json file.
   *  Defaults to process.cwd.
   * @returns {Promise} which resolves to the response from the writeJson
   *  command, or an error.
   */
  setupPackageJson: (dir = cwd) => {
    console.log('creating package.json...');
    execSync('npm init --force', { cwd, stdio: 'ignore' });
    return fs.readJson(path.resolve(dir, 'package.json'))
    .then((p) => {
      if (!p.dependencies) p.dependencies = {};
      Object.keys(devDependencies).forEach((m) => {
        p.dependencies[m] = devDependencies[m];
      });
      if (!p.scripts) p.scripts = {};
      Object.keys(scriptsToAdd)
      .forEach((key) => p.scripts[key] = scriptsToAdd[key]);
      return fs.writeJson(path.resolve(dir, 'package.json'), p,
        { spaces: 2 });
    });
  },
};
