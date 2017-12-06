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
  const subject1 = {
    absolutePath: 'root.node.subject1'
  };
  const subject2 = {
    absolutePath: 'root.node.subject2'
  };

  const ctx = {};
  const aspects = [aspect1];
  const subjects = [subject1, subject2];

  /*
   * Error Handlers (optional)
   * Execute your errorHandlers with doTransform and check that the returned
   * samples have the expected values. doTransform includes validation - you
   * can assume the result is an array of valid sample objects.
   */
  describe('handle errors >', () => {
    it('400', () => {
      const res = { statusCode: 400 };
      const samples = tu.doTransform(ctx, aspects, subjects, res);
      expect(samples).to.be.an('array').with.length(2);
      expect(samples[0]).to.deep.equal({
        name: 'root.node.subject1|aspect1',
        value: 'ERROR',
        messageCode: 'ERROR',
        messageBody: 'got 400 error...',
      });
      expect(samples[1]).to.deep.equal({
        name: 'root.node.subject2|aspect1',
        value: 'ERROR',
        messageCode: 'ERROR',
        messageBody: 'got 400 error...',
      });
    });

    it('501', () => {
      const res = { statusCode: 501 };
      const samples = tu.doTransform(ctx, aspects, subjects, res);
      expect(samples).to.be.an('array').with.length(2);
      expect(samples[0]).to.deep.equal({
        name: 'root.node.subject1|aspect1',
        value: 'ERROR',
        messageCode: 'ERROR',
        messageBody: 'got server error...',
      });
      expect(samples[1]).to.deep.equal({
        name: 'root.node.subject2|aspect1',
        value: 'ERROR',
        messageCode: 'ERROR',
        messageBody: 'got server error...',
      });
    });

    it('403', () => {
      const res = { statusCode: 403 };
      const samples = tu.doTransform(ctx, aspects, subjects, res);
      expect(samples).to.be.an('array').with.length(2);
      expect(samples[0]).to.deep.equal({
        name: 'root.node.subject1|aspect1',
        value: 'ERROR',
        messageCode: 'ERROR',
        messageBody: 'got 403 or 404 error...',
      });
      expect(samples[1]).to.deep.equal({
        name: 'root.node.subject2|aspect1',
        value: 'ERROR',
        messageCode: 'ERROR',
        messageBody: 'got 403 or 404 error...',
      });
    });
  });
});
