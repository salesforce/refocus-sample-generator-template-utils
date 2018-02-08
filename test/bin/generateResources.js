/**
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * test/generateResources.js
 */
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs-extra');
const fork = require('child_process').fork;
const projectName = 'reserved-project-name-for-automated-tests';

describe('test/generateResources.js >', () => {
  beforeEach(() => fs.remove(`./${projectName}`));
  afterEach(() => fs.remove(`./${projectName}`));

  it('generateResources', (done) => {
    expect(fs.existsSync(`./${projectName}`)).to.be.false;
    const forkedProcess = fork('./bin/generateResources.js', [projectName], {});
    forkedProcess.on('close', () => {
      expect(fs.existsSync(`./${projectName}`)).to.be.true;
      expect(fs.readdirSync(`./${projectName}`)).to.have.members([
        'transform', 'connection', 'utils', 'node_modules', 'package.json',
        'README.md', `${projectName}.json`,
      ]);
      expect(fs.readdirSync(`./${projectName}/connection`)).to.have.members([
        'connection.js', 'testConnection.js',
      ]);
      expect(fs.readdirSync(`./${projectName}/transform`)).to.have.members([
        'transform.js', 'testTransform.js',
      ]);
      expect(fs.readdirSync(`./${projectName}/utils`)).to.have.members([
        'testUtils.js',
      ]);
      expect(fs.readdirSync(`./${projectName}/node_modules`)).to.have.members([
        '@salesforce', 'chai', 'chai-url', 'istanbul', 'mocha',
      ]);

      done();
    });
  });
});
