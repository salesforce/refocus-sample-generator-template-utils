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

// use "function" syntax because we're setting this.timeout
describe('test/bin/deploy.js >', function () {
  this.timeout(5000);
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
   * nock doesn't work for a forked process, so the best we can do here is send
   * the request to localhost and expect an error.
   */
  it('provide 3 args but no isPublished flag', (done) => {
    const templateFile = `./${projectName}/${projectName}.json`;
    const refocusUrl = 'http://localhost';
    const refocusToken = 'abcdefg';
    const args = [templateFile, refocusUrl, refocusToken];
    const forkedProcess = fork('./bin/deploy.js', args, { silent: true });
    forkedProcess.stdout.on('data', (data) => {
      expect(data.toString())
      .to.include(`Deploying ${templateFile} to ${refocusUrl} with ` +
        'isPublished=false...');
    });
    forkedProcess.stderr.on('data', (data) => {
      expect(data.toString()).to.include('Error: connect ECONNREFUSED');
    });
    forkedProcess.on('exit', (code) => {
      expect(code).to.equal(0);
      done();
    });
  });

  it('missing args', (done) => {
    const templateFile = `./${projectName}/${projectName}.json`;
    const refocusUrl = 'http://localhost';
    const refocusToken = 'abcdefg';
    const args = [templateFile, refocusUrl];
    const forkedProcess = fork('./bin/deploy.js', args, { silent: true });
    forkedProcess.stderr.on('data', (data) => {
      expect(data.toString())
      .to.include('Error: <templateFile> <refocusUrl> <refocusToken> args are required.');
    });
    forkedProcess.on('exit', (code) => {
      expect(code).to.equal(1);
      done();
    });
  });

  it('set isPublished using short option -p', (done) => {
    const templateFile = `./${projectName}/${projectName}.json`;
    const refocusUrl = 'http://localhost';
    const refocusToken = 'abcdefg';
    const args = [templateFile, refocusUrl, refocusToken, '-p'];
    const forkedProcess = fork('./bin/deploy.js', args, { silent: true });
    forkedProcess.stdout.on('data', (data) => {
      expect(data.toString())
      .to.include(`Deploying ${templateFile} to ${refocusUrl} with ` +
        'isPublished=true...');
    });
    forkedProcess.on('exit', (code) => {
      expect(code).to.equal(0);
      done();
    });
  });

  it('set isPublished using long option --isPublished', (done) => {
    const templateFile = `./${projectName}/${projectName}.json`;
    const refocusUrl = 'http://localhost';
    const refocusToken = 'abcdefg';
    const args = [templateFile, refocusUrl, refocusToken, '-p'];
    const forkedProcess = fork('./bin/deploy.js', args, { silent: true });
    forkedProcess.stdout.on('data', (data) => {
      expect(data.toString())
      .to.include(`Deploying ${templateFile} to ${refocusUrl} with ` +
        'isPublished=true...');
    });
    forkedProcess.on('exit', (code) => {
      expect(code).to.equal(0);
      done();
    });
  });
});
