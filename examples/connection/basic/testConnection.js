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
   * Url (optional)
   *
   * Test your url by calling prepareUrl and check that the
   * returned string is the expected url
   */
  describe('prepareUrl >', () => {
   it('prepareUrl', () => {
     const url = tu.prepareUrl();

     expect(url).to.have.protocol('https');
     expect(url).to.contain.hostname('example.com');
     expect(url).to.contain.path('/expression=-15m:subjects:all:tests:all');
   });
  });

  /**
   * Headers (optional)
   *
   * Test your headers by calling prepareHeaders and check that the returned
   * object contains the expected headers.
   */
  describe('prepareHeaders >', () => {
    it('prepareHeaders', () => {
      const headers = tu.prepareHeaders();
      expect(headers).to.have.property('Accept', 'application/json');
    });
  });
});
