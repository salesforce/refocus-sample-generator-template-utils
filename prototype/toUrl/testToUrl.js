/**
 * testToUrl.js
 */
const expect = require('chai').expect;
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
  const subject1 = {
    absolutePath: 'root.node.subject1'
  };
  const subject2 = {
    absolutePath: 'root.node.subject2'
  };
  const ctx = {};
  const aspects = [aspect1];
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
   *    expect(url.splice(0,4)).to.contain('http'));
   *  });
   *});
  */
});
