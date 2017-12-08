/**
 * testConnection.js
 */
const expect = require('chai').expect;
const helpers = require('./connection.js').helpers;
const tu = require('../utils/testUtils');

describe('connection tests >', () => {
  before(tu.buildConnection);

  /**
   * Helpers (optional)
   *
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
      const concatenatedSubjectNames = helpers.concatArray(subjects);
      expect(concatenatedSubjectNames).to.equal('subject1,subject2');
    });
  });
});
