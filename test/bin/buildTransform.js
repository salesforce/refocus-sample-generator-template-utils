/**
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * test/bin/buildTransform.js
 */
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs-extra');
const fork = require('child_process').fork;
const projectName = 'reserved-project-name-for-automated-tests';

describe('test/bin/buildTransform.js >', () => {
  before((done) => {
    const args = [projectName, '-t', 'basicBulk'];
    const forkedProcess = fork('./bin/generateResources.js', args);
    forkedProcess.on('close', done);
  });
  after(() => fs.remove(`./${projectName}`));

  it('buildTransform', (done) => {
    const sgt = fs.readJsonSync(`./${projectName}/${projectName}.json`);
    expect(sgt.transform.default).to.be.empty;
    const opts = { cwd: `./${projectName}` };
    const forkedProcess = fork('../bin/buildTransform.js', [], opts);
    forkedProcess.on('close', () => {
      const sgt = fs.readJsonSync(`./${projectName}/${projectName}.json`);
      expect(sgt.transform.default).to.not.be.empty;
      done();
    });
  });
});
