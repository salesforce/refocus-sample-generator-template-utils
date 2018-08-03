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
  test: './node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha ' +
    '--report lcovonly -- -R dot transform/testTransform.js connection/testConnection.js ',
  'test-connection': './node_modules/mocha/bin/_mocha ' +
    ' connection/testConnection.js',
  'test-transform': './node_modules/mocha/bin/_mocha ' +
    ' transform/testTransform.js',
  validate: 'echo "validate"',
};

/**
 * Traverses the dependency tree to find all required modules.
 * @param {Array} moduleNames - The top-level modules to search
 * @param {Object} dependencyTree - A tree of modules and their dependencies
 * @returns {Set} A flattened, unique list of dependencies
 */
function getAllDependencies(moduleNames, dependencyTree) {
  let allDependencies = new Set();
  moduleNames.forEach((moduleName) => {
    const module = dependencyTree[moduleName];
    if (module) allDependencies.add(moduleName);
    const nextDependencies = module && module.dependencies;
    if (nextDependencies) {
      getAllDependencies(Object.keys(nextDependencies), nextDependencies)
      .forEach((dep) => allDependencies.add(dep));
    }
  });
  return allDependencies;
}

/**
 * Adds scripts and dependencies to the initialized package.json file.
 *
 * @param {Object} packageJson - The package.json file, in object format.
 */
function addScriptsAndDependencies(packageJson) {
  if (!packageJson.scripts) packageJson.scripts = {};
  Object.keys(scriptsToAdd).forEach((key) => {
    packageJson.scripts[key] = scriptsToAdd[key];
  });

  if (!packageJson.dependencies) packageJson.dependencies = {};
  Object.keys(devDependencies).forEach((m) => {
    packageJson.dependencies[m] = devDependencies[m];
  });
}

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
      fs.mkdirSync(dir);
      cwd = dir;
    } else {
      const errors = validate.errors || validate.warnings;
      throw new Error(errors[0]);
    }
  },

  /**
   * Copy the prototype directory to the specified location.
   * Copy transform and connection examples if specified
   *
   * @param {String} transformExample - the name of the transform example to
   *  be used.
   * @param {String} connectionExample - the name of the connection example to be used.
   * @param {String} toDir - The destination directory. Defaults to
   *  process.cwd
   * @returns {Promise} which resolves to the response from the copy command,
   *  or an error.
   */
  copyPrototype: (transformExample, connectionExample, toDir = cwd) => {
    console.log('copying files to new project...');
    let transformFromDir = path.resolve(__dirname, '../prototype/transform');
    let connectionFromDir = path.resolve(__dirname, '../prototype/connection');
    const utilsFromDir = path.resolve(__dirname, '../prototype/utils');

    const transformToDir = path.resolve(toDir, 'transform');
    const urlToDir = path.resolve(toDir, 'connection');
    const utilsToDir = path.resolve(toDir, 'utils');

    if (transformExample) {
      transformFromDir = path.resolve(__dirname,
        `../examples/transform/${transformExample}`);
    }

    if (connectionExample) {
      connectionFromDir = path.resolve(__dirname,
        `../examples/connection/${connectionExample}`);
    }

    fs.copySync(utilsFromDir, utilsToDir);
    fs.copySync(transformFromDir, transformToDir);
    fs.copySync(connectionFromDir, urlToDir);
  },

  /**
   * Copies devDependencies from this project to the new project
   */
  copyPackages: () => {
    console.log('copying packages...');

    const npmLs = execSync('npm ls --dev --json', { cwd: __dirname });
    const dependencyTree = JSON.parse(npmLs).dependencies;
    const modulesToCopy = Object.keys(devDependencies);

    getAllDependencies(modulesToCopy, dependencyTree)
    .forEach((m) => {
      const fromDir = path.resolve(__dirname, '..', 'node_modules', m);
      const toDir = path.resolve(cwd, 'node_modules', m);
      if (fs.existsSync(fromDir)) {
        fs.copySync(fromDir, toDir);
      }
    });
  },

  getAllDependencies,

  /**
   * Initializes the package.json file, then adds scripts and dependencies.
   *
   * @param {String} dir - The directory to find the package.json file.
   *  Defaults to process.cwd.
   * @returns {Promise} which resolves to the response from the writeJson
   *  command, or an error.
   */
  setupPackageJson: (dir = cwd) => {
    execSync('npm init --force', { cwd: dir, stdio: 'ignore' });
    const p = fs.readJsonSync(path.resolve(dir, 'package.json'));
    addScriptsAndDependencies(p);
    fs.writeJsonSync(path.resolve(dir, 'package.json'), p, { spaces: 2 });
  },

  addScriptsAndDependencies,

  /**
   * Retrieves the contents of the package.json file in the specified
   * directory as a json object.
   *
   * @param {String} dir - The directory to find the package.json file.
   *  Defaults to process.cwd.
   * @returns {Promise} which resolves to json contents of the package.json
   *  file, or an error.
   */
  getPackageInfo: (dir = cwd) =>
    fs.readJsonSync(path.resolve(dir, 'package.json')),

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
    const templateJson = {
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
      transform: {
        default: '',
        errorHandlers: {},
      },
    };

    const filename = `${packageInfo.name}.json`;
    console.log(`creating ${filename}...`);
    fs.writeJsonSync(
      path.resolve(dir, filename),
      templateJson,
      { spaces: 2 });
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
    fs.writeFileSync(
      path.resolve(dir, 'README.md'),
      util.format(readme, packageInfo.name,
        packageInfo.description || 'A Refocus Sample Generator Template.'),
        'utf-8');
  },
};
