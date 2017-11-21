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
  before(tu.buildTransform);

  /*
   * Set up data to be used in the tests.
   */
  const aspect1 = {
    name: 'aspect1',
    timeout: '60s',
  };
  const aspect2 = {
    name: 'aspect2',
    timeout: '60s',
  };
  const subject1 = {
    name: 'subject1',
    absolutePath: 'root.node.subject1',
  };

  const ctx = {};
  const aspects = [aspect1, aspect2];
  const res = {};

  /*
   * Transform
   * Execute your transform function with doTransform and check that the returned
   * samples have the expected values. doTransform includes validation - you can
   * assume the result is an array of valid sample objects.
   */
  describe('transform >', () => {
    it('transform', () => {
      const samples = tu.doTransform(ctx, aspects, subject1, res);
      expect(samples).to.be.an('array').with.length(2);
      expect(samples[0]).to.deep.equal({
        name: 'root.node.subject1|aspect1',
        value: '1',
        messageCode: '0000',
        messageBody: 'this is mock sample 1',
        relatedLinks: [{
          name: 'link1',
          url: 'http://www.example.com/aspect1?data=subject1',
        }],
      });
      expect(samples[1]).to.deep.equal({
        name: 'root.node.subject1|aspect2',
        value: '0',
        messageCode: '0000',
        messageBody: 'this is mock sample 2',
        relatedLinks: [{
          name: 'link1',
          url: 'http://www.example.com/aspect2?data=subject1',
        }],
      });
    });
  });

  /*
   * Helpers (optional)
   * Test helpers directly.
   */
  describe('helpers >', () => {
    it('generateSampleName', () => {
      const subject = {absolutePath: 'aaa.bbb.ccc'};
      const aspect = {name: 'ddd'};
      const sampleName = helpers.generateSampleName(subject, aspect);
      expect(sampleName).to.equal('aaa.bbb.ccc|ddd');
    });

    it('generateSampleUrl', () => {
      const subject = {name: 'ccc'};
      const aspect = {name: 'ddd'};
      const sampleUrl = helpers.generateSampleUrl(subject, aspect);
      expect(sampleUrl).to.equal('http://www.example.com/ddd?data=ccc');
    });
  });

});

