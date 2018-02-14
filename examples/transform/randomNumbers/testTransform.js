/**
 * testTransform.js
 */
const expect = require('chai').expect;
const helpers = require('./transform.js').helpers;
const tu = require('../utils/testUtils');

describe('transform tests >', () => {
  before(tu.buildTransform);

  /**
   * Transform
   *
   * Execute your transform function with doTransform and check that the
   * returned samples have the expected values. doTransform includes validation
   * so you can assume the result is an array of valid sample objects.
   */
  describe('transform >', () => {
    const aspects = [{ name: 'aspect1', timeout: '60s' }];
    const subjects = [
      { name: 's1', absolutePath: 'MyRoot.s1' },
      { name: 's2', absolutePath: 'MyRoot.s2' },
      { name: 's3', absolutePath: 'MyRoot.s3' },
      { name: 's4', absolutePath: 'MyRoot.s4' },
    ];
    const ctx = {
      alternateMessageCode: 'Nooo!',
    };
    const res = {
      text: '100\n114\n72\n-123456',
    };

    it('OK, one aspect, multiple subjects, default separator', () => {
      const samples = tu.doTransform(ctx, aspects, subjects, res);
      expect(samples).to.be.an('array').with.length(4);
      expect(samples[0]).to.deep.equal({
        name: 'MyRoot.s1|aspect1',
        value: '100',
        messageCode: '100',
      });
      expect(samples[1]).to.deep.equal({
        name: 'MyRoot.s2|aspect1',
        value: '114',
        messageCode: '114',
      });
      expect(samples[2]).to.deep.equal({
        name: 'MyRoot.s3|aspect1',
        value: '72',
        messageCode: '72',
      });
      expect(samples[3]).to.deep.equal({
        name: 'MyRoot.s4|aspect1',
        value: '-123456',
        messageCode: 'Nooo!',
      });
    });

    it('OK, one aspect, multiple subjects, alternate separator', () => {
      ctx.separator = '|';
      res.text = '100|114|72|-123456';
      const samples = tu.doTransform(ctx, aspects, subjects, res);
      expect(samples).to.be.an('array').with.length(4);
      expect(samples[0]).to.deep.equal({
        name: 'MyRoot.s1|aspect1',
        value: '100',
        messageCode: '100',
      });
      expect(samples[1]).to.deep.equal({
        name: 'MyRoot.s2|aspect1',
        value: '114',
        messageCode: '114',
      });
      expect(samples[2]).to.deep.equal({
        name: 'MyRoot.s3|aspect1',
        value: '72',
        messageCode: '72',
      });
      expect(samples[3]).to.deep.equal({
        name: 'MyRoot.s4|aspect1',
        value: '-123456',
        messageCode: 'Nooo!',
      });
    });
  });

  /**
   * Helpers (optional)
   *
   * Test helpers directly.
   */
  describe('helpers >', () => {
    describe('safeMessageCode >', () => {
      it('5-char string fits ok, alt provided', () => {
        expect(helpers.safeMessageCode('abcde', 'BIG')).to.equal('abcde');
      });

      it('5-char string fits ok, no alt provided', () => {
        expect(helpers.safeMessageCode('abcde')).to.equal('abcde');
      });

      it('string too long, no alt provided', () => {
        expect(helpers.safeMessageCode('abcdef')).to.equal('');
      });

      it('string too long, alt provided', () => {
        expect(helpers.safeMessageCode('abcdef', 'BIG')).to.equal('BIG');
      });

      it('number fits', () => {
        expect(helpers.safeMessageCode(123.4)).to.equal('123.4');
      });

      it('number too long', () => {
        expect(helpers.safeMessageCode(-123.45)).to.equal('');
      });

      it('boolean', () => {
        expect(helpers.safeMessageCode(true)).to.equal('true');
        expect(helpers.safeMessageCode(false)).to.equal('false');
      });

      it('empty', () => {
        expect(helpers.safeMessageCode()).to.equal('');
        expect(helpers.safeMessageCode(null)).to.equal('');
        expect(helpers.safeMessageCode(undefined)).to.equal('');
      });
    }); // safeMessageCode

    describe('sampleName >', () => {
      it('OK', () => {
        expect(helpers.sampleName('aa.bb.cc', 'dd')).to.equal('aa.bb.cc|dd');
      });

      it('Invalid if inputs are not strings', () => {
        expect(helpers.sampleName([], 'myAspectName')).to.equal(undefined);
        expect(helpers.sampleName('myAbsolutePath', 1)).to.equal(undefined);
        expect(helpers.sampleName('myAbsolutePath', {})).to.equal(undefined);
      });
    }); // sampleName

    describe('splitString >', () => {
      it('OK, \n', () => {
        expect(helpers.splitString('1\n2\n3', '\n')).to.deep.equal(['1', '2', '3']);
      });

      it('OK, $', () => {
        expect(helpers.splitString('a$bcd$efgh', '$')).
        to.deep.equal(['a', 'bcd', 'efgh']);
      });

      it('empty or not a string', () => {
        expect(helpers.splitString('')).to.deep.equal([]);
        expect(helpers.splitString(undefined)).to.deep.equal([]);
        expect(helpers.splitString(null)).to.deep.equal([]);
        expect(helpers.splitString([1, 2, 3])).to.deep.equal([]);
        expect(helpers.splitString({ a: 'bcd' })).to.deep.equal([]);
      });
    }); // splitString
  });
});
