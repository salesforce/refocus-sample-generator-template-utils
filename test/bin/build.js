/**
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * test/bin/build.js
 */
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs-extra');
const fork = require('child_process').fork;
const projectName = 'reserved-project-name-for-automated-tests';

describe('test/bin/build.js >', () => {
  before((done) => {
    const args = [projectName, '-t', 'basicBulk', '-c', 'concatenateAspects'];
    const forkedProcess = fork('./bin/generateResources.js', args);
    forkedProcess.on('close', done);
  });
  after(() => fs.remove(`./${projectName}`));

  it('build', (done) => {
    const sgt = fs.readJsonSync(`./${projectName}/${projectName}.json`);
    expect(sgt.connection).to.not.include.keys('url', 'toUrl');
    expect(sgt.transform.default).to.be.empty;
    expect(sgt.contextDefinition).to.be.empty;
    const opts = { cwd: `./${projectName}` };
    const forkedProcess = fork('../bin/build.js', [], opts);
    forkedProcess.on('close', () => {
      const sgt = fs.readJsonSync(`./${projectName}/${projectName}.json`);
      expect(sgt.connection).to.include.key('toUrl');
      expect(sgt.transform.default).to.not.be.empty;
      expect(sgt.contextDefinition).to.not.be.empty;
      done();
    });
  });
});
