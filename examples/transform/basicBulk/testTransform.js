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
  const sub1_1 = {
    name: 'subject1',
    absolutePath: 'root.node1.subject1',
  };
  const sub1_2 = {
    name: 'subject1',
    absolutePath: 'root.node1.subject2',
  };
  const sub1_3 = {
    name: 'subject1',
    absolutePath: 'root.node1.subject3',
  };
  const sub2_1 = {
    name: 'subject1',
    absolutePath: 'root.node2.subject1',
  };
  const sub2_2 = {
    name: 'subject1',
    absolutePath: 'root.node2.subject2',
  };
  const sub2_3 = {
    name: 'subject3',
    absolutePath: 'root.node2.subject3',
  };

  const ctx = {};
  const res = {
    body: {
      root: {
        node1: {
          subject1: { aspect1: 0, aspect2: 75, },
          subject2: { aspect1: 1, aspect2: 52, },
          subject3: { aspect1: 2, aspect2: 98, },
        },
        node2: {
          subject1: { aspect1: 0, aspect2: 84, },
          subject2: { aspect1: 1, aspect2: 47, },
          subject3: { aspect1: 2, aspect2: 70, },
        },
      },
    },
  };

  /*
   * Transform
   * Execute your transform function with doTransform and check that the returned
   * samples have the expected values. doTransform includes validation - you can
   * assume the result is an array of valid sample objects.
   */
  describe('transform >', () => {
    it('single aspect, all subjects', () => {
      const aspects = [asp1];
      const subjects = [sub1_1, sub1_2, sub1_3, sub2_1, sub2_2, sub2_3];
      const samples = tu.doTransform(ctx, aspects, subjects, res);
      expect(samples).to.be.an('array').with.length(6);
      expect(samples[0]).to.deep.equal({
        name: 'root.node1.subject1|aspect1',
        value: '0',
      });
      expect(samples[1]).to.deep.equal({
        name: 'root.node1.subject2|aspect1',
        value: '1',
      });
      expect(samples[2]).to.deep.equal({
        name: 'root.node1.subject3|aspect1',
        value: '2',
      });
      expect(samples[3]).to.deep.equal({
        name: 'root.node2.subject1|aspect1',
        value: '0',
      });
      expect(samples[4]).to.deep.equal({
        name: 'root.node2.subject2|aspect1',
        value: '1',
      });
      expect(samples[5]).to.deep.equal({
        name: 'root.node2.subject3|aspect1',
        value: '2',
      });
    });

    it('both aspects, three subjects', () => {
      const aspects = [asp1, asp2];
      const subjects = [sub1_2, sub2_1, sub2_3];
      const samples = tu.doTransform(ctx, aspects, subjects, res);
      expect(samples).to.be.an('array').with.length(6);
      expect(samples[0]).to.deep.equal({
        name: 'root.node1.subject2|aspect1',
        value: '1',
      });
      expect(samples[1]).to.deep.equal({
        name: 'root.node1.subject2|aspect2',
        value: '52',
      });
      expect(samples[2]).to.deep.equal({
        name: 'root.node2.subject1|aspect1',
        value: '0',
      });
      expect(samples[3]).to.deep.equal({
        name: 'root.node2.subject1|aspect2',
        value: '84',
      });
      expect(samples[4]).to.deep.equal({
        name: 'root.node2.subject3|aspect1',
        value: '2',
      });
      expect(samples[5]).to.deep.equal({
        name: 'root.node2.subject3|aspect2',
        value: '70',
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
