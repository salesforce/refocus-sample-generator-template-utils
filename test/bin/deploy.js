/**
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * test/bin/deploy.js
 */
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs-extra');
const fork = require('child_process').fork;
const projectName = 'reserved-project-name-for-automated-tests';

describe('test/bin/deploy.js >', () => {
  before((done) => {
    const args = [projectName, '-t', 'basicBulk', '-c', 'concatenateAspects'];
    const forkedProcess = fork('./bin/generateResources.js', args);
    forkedProcess.on('close', () => {
      const opts = { cwd: `./${projectName}` };
      const forkedProcess = fork('../bin/build.js', [], opts);
      forkedProcess.on('close', done);
    });
  });
  after(() => fs.remove(`./${projectName}`));

  /*
    nock doesn't work for a forked process, so the best we can do here is send
    the request to localhost and expect an error.
  */
  it('deploy', (done) => {
    const templateFile = `./${projectName}/${projectName}.json`;
    const refocusUrl = 'http://localhost';
    const refocusToken = 'abcdefg';
    const args = [templateFile, refocusUrl, refocusToken];
    const forkedProcess = fork('./bin/deploy.js', args, { silent: true });
    forkedProcess.stderr.on('data', (data) => {
      expect(data.toString()).to.include('Error: connect ECONNREFUSED');
      done();
    });
  });
});
