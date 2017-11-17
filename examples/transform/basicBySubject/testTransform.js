/**
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * testTransform.js
 */
const expect = require('chai').expect;
const helpers = require('./transform.js').helpers;
const tu = require('../utils/testUtils');

describe('transform tests >', () => {
  before(tu.build);

  /*
   * Set up data to be used in the tests.
   */

  const asp1 = {
    name: 'aspect1',
    timeout: '60s',
  };
  const asp2 = {
    name: 'aspect2',
    timeout: '60s',
  };
  const ctx = {};

  /*
   * Transform
   * Execute your transform function with doTransform and check that the returned
   * samples have the expected values. doTransform includes validation - you can
   * assume the result is an array of valid sample objects.
   */
  describe('transform >', () => {
    it('one aspect', () => {
      const aspects = [asp1];
      const subject = {
        name: 'subject1',
        absolutePath: 'root.node1.subject1',
      };
      const res = {
        body: {
          aspect1: 0,
          aspect2: 75,
        },
      };
      const samples = tu.doTransform(ctx, aspects, subject, res);
      expect(samples).to.be.an('array').with.length(1);
      expect(samples[0]).to.deep.equal({
        name: 'root.node1.subject1|aspect1',
        value: '0',
      });
    });

    it('both aspects', () => {
      const aspects = [asp1, asp2];
      const subject = {
        name: 'subject1',
        absolutePath: 'root.node1.subject1',
      };
      const res = {
        body: {
          aspect1: 0,
          aspect2: 75,
        },
      };
      const samples = tu.doTransform(ctx, aspects, subject, res);
      expect(samples).to.be.an('array').with.length(2);
      expect(samples[0]).to.deep.equal({
        name: 'root.node1.subject1|aspect1',
        value: '0',
      });
      expect(samples[1]).to.deep.equal({
        name: 'root.node1.subject1|aspect2',
        value: '75',
      });
    });
  });

  /*
   * Helpers (optional)
   * Test helpers directly.
   */
  describe('helpers >', () => {
    it('generateSampleName', () => {
      const subject = { absolutePath: 'aaa.bbb.ccc' };
      const aspect = { name: 'ddd' };
      const sampleName = helpers.generateSampleName(subject, aspect);
      expect(sampleName).to.equal('aaa.bbb.ccc|ddd');
    });
  });
});
