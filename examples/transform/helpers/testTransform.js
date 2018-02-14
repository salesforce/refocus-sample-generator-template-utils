/**
 * testTransform.js
 */
const expect = require('chai').expect;
const helpers = require('./transform.js').helpers;
const tu = require('../utils/testUtils');

describe('transform tests >', () => {
  before(tu.buildTransform);

  /**
   * Helpers (optional)
   *
   * Test helpers directly.
   */
  describe('helpers >', () => {
    it('generateSampleName', () => {
      const subject = { absolutePath: 'aaa.bbb.ccc' };
      const aspect = { name: 'ddd' };
      const sampleName = helpers.generateSampleName(subject, aspect);
      expect(sampleName).to.equal('aaa.bbb.ccc|ddd');
    });

    it('truncateMessage', () => {
      expect(helpers.truncateMessage('1234567890', 10)).to.equal('1234567890');
      expect(helpers.truncateMessage('12345678900', 10)).to.equal('1234567...');
    });
  });

});
