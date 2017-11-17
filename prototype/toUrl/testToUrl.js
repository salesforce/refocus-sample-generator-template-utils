/**
 * testToUrl.js
 */
const chai = require('chai');
chai.use(require('chai-url'));
const expect = chai.expect;
const tu = require('../utils/testUtils');

describe('toUrl tests >', () => {
  before(tu.build);

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

  /*
   * toUrl
   * Execute your toUrl function by calling generateUrl and check that the
   * returned string is an expected url
   */

  /*
   *describe('generateUrl >', () => {
   *  it('generateUrl', () => {
   *    const url = tu.generateUrl(ctx, aspects, subjects);
   *    expect(url).to.have.protocol('https');
   *  });
   *});
  */
});
