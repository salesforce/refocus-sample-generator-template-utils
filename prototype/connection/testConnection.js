/**
 * testConnection.js
 */
const chai = require('chai');
chai.use(require('chai-url'));
const expect = chai.expect;
const helpers = require('./connection.js').helpers;
const tu = require('../utils/testUtils');

describe('connection tests >', () => {
  before(tu.buildConnection);

  /**
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
    absolutePath: 'root.node.subject1',
    name: 'subject1',
  };
  const subject2 = {
    absolutePath: 'root.node.subject2',
    name: 'subject2',
  };
  const ctx = {
    baseUrl: 'https://dummyUrl.io',
    window: '-15m',
  };
  const aspects = [aspect1, aspect2];
  const subjects = [subject1, subject2];

  /**
   * Url (optional)
   *
   * Test your url by calling prepareUrl and check that the
   * returned string is the expected url
   */
  /*
  describe('prepareUrl >', () => {
    it('prepareUrl', () => {
      const url = tu.prepareUrl(ctx);
      expect(url).to.have.protocol('https');
    });
  });
  */

  /**
   * ToUrl (optional)
   *
   * Execute your toUrl function by calling prepareUrl and check that the
   * returned string is an expected url
   */
  /*
  describe('prepareUrl >', () => {
    it('prepareUrl', () => {
      const url = tu.prepareUrl(ctx, aspects, subjects);
      expect(url).to.have.protocol('https');
    });
  });
  */

  /**
   * Headers (optional)
   *
   * Test your headers by calling prepareHeaders and check that the returned
   * object contains the expected headers.
   */
  /*
  describe('prepareHeaders >', () => {
    it('prepareHeaders', () => {
      const headers = tu.prepareHeaders(ctx);
      expect(headers).to.have.property('Accept', 'application/json');
    });
  });
  */

  /**
   * Helpers (optional)
   *
   * Test helpers directly.
   */
  /*
  describe('helpers >', () => {
    it('concatArray', () => {
      const subjects = [{name: 's1'}, {name: 's2'}];
      const concatenatedSubjectNames = helpers.concatArray(subjects);
      expect(concatenatedSubjectNames).to.equal('s1,s2');
    });
  });
  */

});
