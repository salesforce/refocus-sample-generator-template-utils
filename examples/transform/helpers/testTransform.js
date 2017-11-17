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

    it('truncateMessage', () => {
      expect(helpers.truncateMessage('1234567890', 10)).to.equal('1234567890');
      expect(helpers.truncateMessage('12345678900', 10)).to.equal('1234567...');
    });
  });

});
