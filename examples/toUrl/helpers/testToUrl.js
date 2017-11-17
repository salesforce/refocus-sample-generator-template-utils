/**
 * Copyright (c) 2017, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * testToUrl.js
 */
const expect = require('chai').expect;
const helpers = require('./toUrl.js').helpers;
const tu = require('../utils/testUtils');

describe('transform tests >', () => {
  before(tu.build);

  /*
   * Helpers (optional)
   * Test helpers directly.
   */
  describe('helpers >', () => {
    it('concatArray', () => {
      const subject1 = {
        absolutePath: 'root.node.subject1',
        name: 'subject1',
      };
      const subject2 = {
        absolutePath: 'root.node.subject2',
        name: 'subject2',
      };
      const subjects = [subject1, subject2];
      const concatinatedAubjectNames = helpers.concatArray(subjects);
      expect(concatinatedAubjectNames).to.equal('subject1,subject2');
    });
  });

});
