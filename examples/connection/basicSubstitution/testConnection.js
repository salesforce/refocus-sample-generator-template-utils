/**
 * testConnection.js
 */
const chai = require('chai');
chai.use(require('chai-url'));
const expect = chai.expect;
const tu = require('../utils/testUtils');

describe('connection tests >', () => {
  before(tu.buildConnection);

  /**
   * Set up data to be used in the tests.
   */
  const ctx = {
    baseUrl: 'dummyUrl.io',
  };

  /**
   * Url (optional)
   *
   * Test your url by calling prepareUrl and check that the
   * returned string is the expected url.
   */
  describe('prepareUrl >', () => {
    it('prepareUrl, default window', () => {
      const url = tu.prepareUrl(ctx);

      expect(url).to.have.protocol('https');
      expect(url).to.contain.hostname('dummyurl.io');
      expect(url).to.contain.path('?expression=-15m:subjects:all:tests:all');
    });

    it('prepareUrl, alternate window', () => {
      ctx.window = '-22m';
      const url = tu.prepareUrl(ctx);

      expect(url).to.have.protocol('https');
      expect(url).to.contain.hostname('dummyurl.io');
      expect(url).to.contain.path('?expression=-22m:subjects:all:tests:all');
    });
  });

  /**
   * Headers (optional)
   *
   * Test your headers by calling prepareHeaders and check that the returned
   * object contains the expected headers.
   */
  describe('prepareHeaders >', () => {
    it('prepareHeaders, default', () => {
      const headers = tu.prepareHeaders(ctx);
      expect(headers).to.have.property('Accept', 'text/plain');
    });

    it('prepareHeaders, alternate subtype', () => {
      ctx.subtype = 'html';
      const headers = tu.prepareHeaders(ctx);
      expect(headers).to.have.property('Accept', 'text/html');
    });

    it('prepareHeaders, alternate type and subtype', () => {
      ctx.type = 'application';
      ctx.subtype = 'json';
      const headers = tu.prepareHeaders(ctx);
      expect(headers).to.have.property('Accept', 'application/json');
    });
  });
});
