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
  };
  const subject2 = {
    absolutePath: 'root.node.subject2',
  };
  const ctx = {
    baseUrl: 'https://dummyUrl.io',
  };
  const aspects = [aspect1, aspect2];
  const subjects = [subject1, subject2];

  /**
   * ToUrl (optional)
   *
   * Execute your toUrl function by calling prepareUrl and check that the
   * returned string is an expected url
   */
  describe('prepareUrl >', () => {
    it('prepareUrl, default window', () => {
      const url = tu.prepareUrl(ctx, aspects, subjects);

      expect(url).to.have.protocol('https');
      expect(url).to.contain.hostname('dummyurl.io');
      expect(url).to.contain.path('?expression=-15m:subjects:all:' +
       'tests:[aspect1,aspect2]');
    });

    it('prepareUrl, alternate window', () => {
      ctx.window = '-22m';
      const url = tu.prepareUrl(ctx, aspects, subjects);

      expect(url).to.have.protocol('https');
      expect(url).to.contain.hostname('dummyurl.io');
      expect(url).to.contain.path('?expression=-22m:subjects:all:' +
        'tests:[aspect1,aspect2]');
    });
  });

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
