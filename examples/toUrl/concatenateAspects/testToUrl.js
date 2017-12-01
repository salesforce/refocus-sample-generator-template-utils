/**
 * testToUrl.js
 */
const chai = require('chai');
chai.use(require('chai-url'));
const expect = chai.expect;
const tu = require('../utils/testUtils');

describe('toUrl tests >', () => {
  before(tu.buildToUrl);

  /*
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
    absolutePath: 'root.node.subject1'
  };
  const subject2 = {
    absolutePath: 'root.node.subject2'
  };
  const ctx = {
    baseUrl: 'https://dummyUrl.io',
  };
  const aspects = [aspect1, aspect2];
  const subjects = [subject1, subject2];

  /*
   * toUrl
   * Execute your toUrl function by calling generateUrl and check that the
   * returned string is an expected url
   */
  describe('generateUrl >', () => {
   it('generateUrl, default window', () => {
     const url = tu.generateUrl(ctx, aspects, subjects);

     expect(url).to.have.protocol('https');
     expect(url).to.contain.hostname('dummyurl.io');
     expect(url).to.contain.path('/expression=-15m:subjects:all:' +
      'tests:[aspect1,aspect2]');
   });

    it('generateUrl, alternate window', () => {
      ctx.window = '-22m';
      const url = tu.generateUrl(ctx, aspects, subjects);

      expect(url).to.have.protocol('https');
      expect(url).to.contain.hostname('dummyurl.io');
      expect(url).to.contain.path('/expression=-22m:subjects:all:' +
        'tests:[aspect1,aspect2]');
    });
  });
});
