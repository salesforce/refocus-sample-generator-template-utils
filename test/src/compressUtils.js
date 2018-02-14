/**
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * test/compressUtils.js
 */
const expect = require('chai').expect;
const cu = require('../../src/compressUtils');
const mockFs = require('mock-fs');
const mockRequire = require('mock-require');
const path = require('path');
const fs = require('fs-extra');

describe('test/compressUtils.js >', () => {

  describe('buildConnection >', () => {
    const mockConnection = {
      toUrl(ctx, aspects, subjects) {
        const sNames = concatArray(subjects);
        return `${ctx.baseUrl}?expression=${ctx.window}:subjects:[${sNames}]`;
      },

      headers: {
        Accept: '{{type}}/{{subtype}}',
      },
      contextDefinition: {
        baseUrl: { description: 'the base url to add the params to', },
        window: { description: 'the window value to be set in the url', },
        type: { description: 'The content-type type', },
        subtype: { description: 'The content-type subtype', },
      },
      helpers: {
        concatArray(arr) {
          return arr.map((e) => e.name).join(',');
        },
      },
    };

    const SGT = {
      name: 'my-sgt',
      version: '1.0.0',
      description: '',
      tags: [
        'my-sgt',
      ],
      author: '',
      connection: {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
      contextDefinition: {},
      transform: {
        default: '',
        errorHandlers: {},
      },
    };

    function setupMockFiles(mockConnection, mockSGT) {
      const connectionPath = path.resolve('./my-sgt/connection/connection.js');
      mockRequire(connectionPath, mockConnection);
      mockFs({
        './my-sgt': {
          'my-sgt.json': JSON.stringify(mockSGT),
        },
      });
    }

    let mockSGT;
    beforeEach(() => {
      mockSGT = JSON.parse(JSON.stringify(SGT));
    });

    after(() => {
      mockFs.restore();
      mockRequire.stopAll();
    });

    it('SGT file is updated', () => {
      setupMockFiles(mockConnection, mockSGT);

      const expectedSGT = JSON.parse(JSON.stringify(mockSGT));
      cu.doBuildConnection(mockConnection, expectedSGT.connection);
      expectedSGT.contextDefinition = mockConnection.contextDefinition;

      cu.buildConnection('./my-sgt');
      const sgt = fs.readJsonSync('./my-sgt/my-sgt.json');
      expect(sgt).to.deep.equal(expectedSGT);
    });

    it('pre-existing contextDefinition', () => {
      mockSGT.contextDefinition = {
        ctx1: {
          description: 'ctx1',
        },
      };

      setupMockFiles(mockConnection, mockSGT);

      const expectedContextDefinition = {
        ctx1: { description: 'ctx1' },
        baseUrl: { description: 'the base url to add the params to' },
        window: { description: 'the window value to be set in the url' },
        type: { description: 'The content-type type' },
        subtype: { description: 'The content-type subtype' },
      };

      const expectedSGT = JSON.parse(JSON.stringify(mockSGT));
      cu.doBuildConnection(mockConnection, expectedSGT.connection);
      expectedSGT.contextDefinition = expectedContextDefinition;

      cu.buildConnection('./my-sgt');
      const sgt = fs.readJsonSync('./my-sgt/my-sgt.json');
      expect(sgt).to.deep.equal(expectedSGT);
    });

    it('no pre-existing contextDefinition', () => {
      delete mockSGT.contextDefinition;
      setupMockFiles(mockConnection, mockSGT);

      const expectedSGT = JSON.parse(JSON.stringify(mockSGT));
      expectedSGT.contextDefinition = {};
      cu.doBuildConnection(mockConnection, expectedSGT.connection);
      expectedSGT.contextDefinition = mockConnection.contextDefinition;

      cu.buildConnection('./my-sgt');
      const sgt = fs.readJsonSync('./my-sgt/my-sgt.json');
      expect(sgt).to.deep.equal(expectedSGT);
    });

    it('no pre-existing connection', () => {
      delete mockSGT.connection;
      setupMockFiles(mockConnection, mockSGT);

      const expectedSGT = JSON.parse(JSON.stringify(mockSGT));
      expectedSGT.connection = {};
      cu.doBuildConnection(mockConnection, expectedSGT.connection);
      expectedSGT.contextDefinition = mockConnection.contextDefinition;

      cu.buildConnection('./my-sgt');
      const sgt = fs.readJsonSync('./my-sgt/my-sgt.json');
      expect(sgt).to.deep.equal(expectedSGT);
    });

  });

  describe('buildTransform >', () => {
    const mockTransformBulk = {
      transformBulk(ctx, aspects, subjects, res) {
        return [{ name: generateSampleName('aaa', 'bbb'), value: ctx.val }];
      },

      errorHandlers: {
        404: function (ctx, aspects, subjects, res) {
          return [{ name: generateSampleName('aaa', 'bbb'), value: ctx.errVal }];
        },

        500: function (ctx, aspects, subjects, res) {
          return [{ name: generateSampleName('aaa', 'bbb'), value: ctx.errVal }];
        },
      },

      contextDefinition: {
        val: {
          description: 'value',
        },
        errVal: {
          description: 'errVal',
        },
      },

      helpers: {
        generateSampleName(subject, aspect) {
          return `${subject.absolutePath}|${aspect.name}`;
        },
      },
    };

    const mockTransformBySubject = {
      transformBySubject(ctx, aspects, subject, res) {
        return [{ name: generateSampleName('aaa', 'bbb'), value: ctx.val }];
      },

      errorHandlers: {
        404: function (ctx, aspects, subject, res) {
          return [{ name: generateSampleName('aaa', 'bbb'), value: ctx.errVal }];
        },

        500: function (ctx, aspects, subject, res) {
          return [{ name: generateSampleName('aaa', 'bbb'), value: ctx.errVal }];
        },
      },

      contextDefinition: {
        val: {
          description: 'value',
        },
        errVal: {
          description: 'errVal',
        },
      },

      helpers: {
        generateSampleName(subject, aspect) {
          return `${subject.absolutePath}|${aspect.name}`;
        },
      },
    };

    const SGT = {
      name: 'my-sgt',
      version: '1.0.0',
      description: '',
      tags: [
        'my-sgt',
      ],
      author: '',
      connection: {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
      contextDefinition: {},
      transform: {
        default: '',
        errorHandlers: {},
      },
    };

    function setupMockFiles(mockTransform, mockSGT) {
      const transformPath = path.resolve('./my-sgt/transform/transform.js');
      mockRequire(transformPath, mockTransform);
      mockFs({
        './my-sgt': {
          'my-sgt.json': JSON.stringify(mockSGT),
        },
      });
    }

    let mockSGT;
    beforeEach(() => {
      mockSGT = JSON.parse(JSON.stringify(SGT));
    });

    after(() => {
      mockFs.restore();
      mockRequire.stopAll();
    });

    it('bulk', () => {
      setupMockFiles(mockTransformBulk, mockSGT);

      const expectedSGT = JSON.parse(JSON.stringify(mockSGT));
      const { transformObj } = cu.doBuildTransform(mockTransformBulk);
      expectedSGT.transform = transformObj;
      expectedSGT.connection.bulk = true;
      expectedSGT.contextDefinition = mockTransformBulk.contextDefinition;

      cu.buildTransform('./my-sgt');
      const sgt = fs.readJsonSync('./my-sgt/my-sgt.json');
      expect(sgt).to.deep.equal(expectedSGT);
    });

    it('bySubject', () => {
      setupMockFiles(mockTransformBySubject, mockSGT);

      const expectedSGT = JSON.parse(JSON.stringify(mockSGT));
      const { transformObj } = cu.doBuildTransform(mockTransformBySubject);
      expectedSGT.transform = transformObj;
      expectedSGT.connection.bulk = false;
      expectedSGT.contextDefinition = mockTransformBulk.contextDefinition;

      cu.buildTransform('./my-sgt');
      const sgt = fs.readJsonSync('./my-sgt/my-sgt.json');
      expect(sgt).to.deep.equal(expectedSGT);
    });

    it('pre-existing contextDefinition', () => {
      mockSGT.contextDefinition = {
        ctx1: {
          description: 'ctx1',
        },
      };

      setupMockFiles(mockTransformBulk, mockSGT);

      const expectedContextDefinition = {
        ctx1: { description: 'ctx1' },
        val: { description: 'value', },
        errVal: { description: 'errVal', },
      };

      const expectedSGT = JSON.parse(JSON.stringify(mockSGT));
      const { transformObj } = cu.doBuildTransform(mockTransformBulk);
      expectedSGT.transform = transformObj;
      expectedSGT.connection.bulk = true;
      expectedSGT.contextDefinition = expectedContextDefinition;

      cu.buildTransform('./my-sgt');
      const sgt = fs.readJsonSync('./my-sgt/my-sgt.json');
      expect(sgt).to.deep.equal(expectedSGT);
    });

    it('no pre-existing contextDefinition', () => {
      delete mockSGT.contextDefinition;
      setupMockFiles(mockTransformBulk, mockSGT);

      const expectedSGT = JSON.parse(JSON.stringify(mockSGT));
      const { transformObj } = cu.doBuildTransform(mockTransformBulk);
      expectedSGT.contextDefinition = {};
      expectedSGT.transform = transformObj;
      expectedSGT.connection.bulk = true;
      expectedSGT.contextDefinition = mockTransformBulk.contextDefinition;

      cu.buildTransform('./my-sgt');
      const sgt = fs.readJsonSync('./my-sgt/my-sgt.json');
      expect(sgt).to.deep.equal(expectedSGT);
    });

    it('no pre-existing connection', () => {
      delete mockSGT.connection;
      setupMockFiles(mockTransformBulk, mockSGT);

      const expectedSGT = JSON.parse(JSON.stringify(mockSGT));
      const { transformObj } = cu.doBuildTransform(mockTransformBulk);
      expectedSGT.connection = {};
      expectedSGT.transform = transformObj;
      expectedSGT.connection.bulk = true;
      expectedSGT.contextDefinition = mockTransformBulk.contextDefinition;

      cu.buildTransform('./my-sgt');
      const sgt = fs.readJsonSync('./my-sgt/my-sgt.json');
      expect(sgt).to.deep.equal(expectedSGT);
    });
  });

  describe('doBuildConnection >', () => {
    function expectCompressed(toUrlString, exports) {
      const toUrl = exports.toUrl;
      const helpers = exports.helpers || {};
      const compressed = cu.compress(toUrl.toString(), helpers);
      expect(toUrlString).to.equal(compressed);
    }

    it('url', () => {
      const connectionObj = {};
      const exports = {
        url: 'https://www.example.com',
      };

      cu.doBuildConnection(exports, connectionObj);
      expect(connectionObj).to.have.keys('url');
      expect(connectionObj.url).to.equal(exports.url);
    });

    it('toUrl', () => {
      const connectionObj = {};
      const exports = {
        toUrl(ctx, aspects, subjects) {
          return 'http://www.example.com';
        },
      };

      cu.doBuildConnection(exports, connectionObj);
      expect(connectionObj).to.have.keys('toUrl');
      expectCompressed(connectionObj.toUrl, exports);
    });

    it('both url/toUrl defined', () => {
      const connectionObj = {};
      const exports = {
        url: 'https://www.example.com',
        toUrl(ctx, aspects, subjects) {
          return 'http://www.example.com';
        },
      };

      expect(() => cu.doBuildConnection(exports, connectionObj)).to.throw(
        '"url" and "toUrl" cannot both be defined. Remove one.'
      );
    });

    it('invalid url name', () => {
      const connectionObj = {};
      const exports = {
        urlString: 'https://www.example.com',
      };

      expect(() => cu.doBuildConnection(exports, connectionObj)).to.throw(
        'You must define either "url" or "toUrl".'
      );
    });

    it('invalid toUrl name', () => {
      const connectionObj = {};
      const exports = {
        toUrlFunc(ctx, aspects, subjects) {
          return 'http://www.example.com';
        },
      };

      expect(() => cu.doBuildConnection(exports, connectionObj)).to.throw(
        'You must define either "url" or "toUrl".'
      );
    });

    it('no url/toUrl defined', () => {
      const connectionObj = {};
      const exports = {
        headers: {
          Accept: 'text/html',
        },
      };

      expect(() => cu.doBuildConnection(exports, connectionObj)).to.throw(
        'You must define either "url" or "toUrl".'
      );
    });

    it('empty', () => {
      const connectionObj = {};
      const exports = {};

      expect(() => cu.doBuildConnection(exports, connectionObj)).to.throw(
        'You must define either "url" or "toUrl".'
      );
    });

    it('url not a string', () => {
      const connectionObj = {};
      const exports = {
        url(ctx, aspects, subjects) {
          return 'http://www.example.com';
        },
      };

      expect(() => cu.doBuildConnection(exports, connectionObj)).to.throw(
        '"url" must be a string.'
      );
    });

    it('toUrl not a function', () => {
      const connectionObj = {};
      const exports = {
        toUrl: 'http://www.example.com',
      };

      expect(() => cu.doBuildConnection(exports, connectionObj)).to.throw(
        '"toUrl" must be a function.'
      );
    });

    it('toUrl with helpers', () => {
      const connectionObj = {};
      const exports = {
        toUrl(ctx, aspects, subjects) {
          return `http://www.example.com?aspects=${concatArray(aspects)}`;
        },

        helpers: {
          concatArray(arr) {
            return arr.map((e) => e.name).join(',');
          },
        },
      };

      cu.doBuildConnection(exports, connectionObj);
      expect(connectionObj).to.have.keys('toUrl');
      expectCompressed(connectionObj.toUrl, exports);
    });

    it('helper not a function', () => {
      const connectionObj = {};
      const exports = {
        toUrl(ctx, aspects, subjects) {
          return `http://www.example.com?aspects=${concatArray(aspects)}`;
        },

        helpers: {
          concatArray: 'a1,a2,a3',
        },
      };

      expect(() => cu.doBuildConnection(exports, connectionObj)).to.throw(
        'helpers must be functions'
      );
    });

    it('url with contextDefinition', () => {
      const connectionObj = {};
      const exports = {
        url: 'https://{{baseUrl}}?expression={{window}}:subjects:all:tests:all',
        contextDefinition: {
          baseUrl: {
            description: 'the base url to add the params to',
            required: true,
          },
          window: {
            description: 'the window value to be set in the url',
            required: false,
            default: '-15m',
          },
        },
      };

      cu.doBuildConnection(exports, connectionObj);
      expect(connectionObj).to.have.keys('url');
      expect(connectionObj.url).to.equal(exports.url);
    });

    it('toUrl with contextDefinition', () => {
      const connectionObj = {};
      const exports = {
        toUrl(ctx, aspects, subjects) {
          return `http://${ctx.baseUrl}?expression=${ctx.window}:subjects:all`;
        },

        contextDefinition: {
          baseUrl: {
            description: 'the base url to add the params to',
            required: true,
          },
          window: {
            description: 'the window value to be set in the url',
            required: false,
            default: '-15m',
          },
        },
      };

      cu.doBuildConnection(exports, connectionObj);
      expect(connectionObj).to.have.keys('toUrl');
      expectCompressed(connectionObj.toUrl, exports);
    });

    it('validateCtxDef applied', () => {
      const connectionObj = {};
      const exports = {
        url: 'https://{{baseUrl}}?expression={{window}}:subjects:all:tests:all',
        contextDefinition: {
          baseUrl: {},
        },
      };

      expect(() => cu.doBuildConnection(exports, connectionObj)).to.throw(
        'contextDefinition.baseUrl: description required'
      );
    });

    it('validateCtxUsages applied to toUrl', () => {
      const connectionObj = {};
      const exports = {
        toUrl(ctx, aspects, subjects) {
          return `http://${ctx.baseUrl}?expression=${ctx.window}:subjects:all`;
        },

        contextDefinition: {
          baseUrl: {
            description: 'the base url to add the params to',
            required: true,
          },
        },
      };

      expect(() => cu.doBuildConnection(exports, connectionObj)).to.throw(
        'context variable "window" used in toUrl is not defined in ' +
        'contextDefinition'
      );
    });

    it('headers', () => {
      const connectionObj = {};
      const exports = {
        url: 'https://www.example.com',
        headers: {
          Accept: '{{type}}/{{subtype}}',
        },
        contextDefinition: {
          type: {
            description: 'The content-type type',
            required: false,
            default: 'text',
          },
          subtype: {
            description: 'The content-type subtype',
            required: false,
            default: 'plain',
          },
        },
      };

      cu.doBuildConnection(exports, connectionObj);
      expect(connectionObj).to.have.keys('url', 'headers');
      expect(connectionObj.url).to.equal(exports.url);
      expect(connectionObj.headers).to.equal(exports.headers);
    });

    it('existing connection object (url -> toUrl)', () => {
      const connectionObj = {
        url: 'https://www.example.com',
      };
      const exports = {
        toUrl(ctx, aspects, subjects) {
          return 'http://www.example.com';
        },
      };

      cu.doBuildConnection(exports, connectionObj);
      expect(connectionObj).to.have.keys('toUrl');
      expectCompressed(connectionObj.toUrl, exports);
    });

    it('existing connection object (toUrl -> url)', () => {
      const connectionObj = {
        toUrl(ctx, aspects, subjects) {
          return 'http://www.example.com';
        },
      };
      const exports = {
        url: 'https://www.example.com',
      };

      cu.doBuildConnection(exports, connectionObj);
      expect(connectionObj).to.have.keys('url');
      expect(connectionObj.url).to.equal(exports.url);
    });

    it('existing connection object (url -> url)', () => {
      const connectionObj = {
        url: 'https://www.example.com',
      };
      const exports = {
        url: 'https://www.example2.com',
      };

      cu.doBuildConnection(exports, connectionObj);
      expect(connectionObj).to.have.keys('url');
      expect(connectionObj.url).to.equal(exports.url);
    });

    it('existing connection object (toUrl -> toUrl)', () => {
      const connectionObj = {
        toUrl(ctx, aspects, subjects) {
          return 'http://www.example.com';
        },
      };
      const exports = {
        toUrl(ctx, aspects, subjects) {
          return 'http://www.example2.com';
        },
      };

      cu.doBuildConnection(exports, connectionObj);
      expect(connectionObj).to.have.keys('toUrl');
      expectCompressed(connectionObj.toUrl, exports);
    });

    it('existing connection object - values not overwritten', () => {
      const connectionObj = {
        url: 'https://www.example.com',
        headers: {
          Accept: 'application/json',
        },
        method: 'GET',
        proxy: 'http://www.example.com',
        bulk: true,
      };
      const exports = {
        toUrl(ctx, aspects, subjects) {
          return 'http://www.example2.com';
        },
      };

      cu.doBuildConnection(exports, connectionObj);
      expect(connectionObj).to.have.keys(
        'toUrl', 'headers', 'method', 'proxy', 'bulk'
      );
      expectCompressed(connectionObj.toUrl, exports);
      expect(connectionObj.headers).to.deep.equal({ Accept: 'application/json' });
      expect(connectionObj.method).to.equal('GET');
      expect(connectionObj.proxy).to.equal('http://www.example.com');
      expect(connectionObj.bulk).to.equal(true);
    });
  });

  describe('doBuildTransform >', () => {
    function expectCompressed(transformObj, exports) {
      const defTransform = exports.transformBulk || exports.transformBySubject;
      const errorHandlers = exports.errorHandlers;
      const errorHandlerKeys = errorHandlers ? Object.keys(errorHandlers) : [];
      const helpers = exports.helpers || {};

      //keys
      if (defTransform) {
        expect(transformObj).to.have.keys('default', 'errorHandlers');
      } else {
        expect(transformObj).to.have.keys('errorHandlers');
      }

      if (errorHandlerKeys.length) {
        expect(transformObj.errorHandlers).to.have.keys(errorHandlerKeys);
      } else {
        expect(transformObj.errorHandlers).to.be.empty;
      }

      //default
      if (defTransform) {
        const compressed = cu.compress(defTransform.toString(), helpers);
        expect(transformObj.default).to.equal(compressed);
      }

      //errorHandlers
      errorHandlerKeys.forEach((key) => {
        const compressed = cu.compress(errorHandlers[key].toString(), helpers);
        expect(transformObj.errorHandlers[key]).to.equal(compressed);
      });
    }

    it('default (bulk)', () => {
      const exports = {
        transformBulk(ctx, aspects, subjects, res) {
          return [{ name: 'aaa|bbb', value: '0' }];
        },
      };

      const { transformObj, bulk } = cu.doBuildTransform(exports);
      expectCompressed(transformObj, exports);
      expect(bulk).to.be.true;
    });

    it('default (bySubject)', () => {
      const exports = {
        transformBySubject(ctx, aspects, subject, res) {
          return [{ name: 'aaa|bbb', value: '0' }];
        },
      };

      const { transformObj, bulk } = cu.doBuildTransform(exports);
      expectCompressed(transformObj, exports);
      expect(bulk).to.be.false;
    });

    it('signature does not match function name (bulk)', () => {
      const exports = {
        transformBulk(ctx, aspects, subject, res) {
          return [{ name: 'aaa|bbb', value: '0' }];
        },
      };

      expect(() => cu.doBuildTransform(exports)).to.throw(
        'Invalid function signature: "transformBulk" must have "subjects" param'
      );
    });

    it('signature does not match function name (bySubject)', () => {
      const exports = {
        transformBySubject(ctx, aspects, subjects, res) {
          return [{ name: 'aaa|bbb', value: '0' }];
        },
      };

      expect(() => cu.doBuildTransform(exports)).to.throw(
        'Invalid function signature: "transformBySubject" must have ' +
        '"subject" param.'
      );
    });

    it('both bulk and bySubject defined (error)', () => {
      const exports = {
        transformBulk(ctx, aspects, subjects, res) {
          return [{ name: 'aaa|bbb', value: '0' }];
        },

        transformBySubject(ctx, aspects, subject, res) {
          return [{ name: 'aaa|bbb', value: '0' }];
        },
      };

      expect(() => cu.doBuildTransform(exports)).to.throw(
        'Only one transform function can be defined. Comment out the other one.'
      );
    });

    it('invalid transform name', () => {
      const exports = {
        transform(ctx, aspects, subjects, res) {
          return [{ name: 'aaa|bbb', value: '0' }];
        },
      };

      const { transformObj, bulk } = cu.doBuildTransform(exports);
      expect(transformObj).to.deep.equal({ errorHandlers: {} });
      expect(bulk).to.be.undefined;
    });

    it('no transform defined', () => {
      const exports = {
        helpers: {
          generateSampleName(subject, aspect) {
            return `${subject.absolutePath}|${aspect.name}`;
          },
        },
      };

      const { transformObj, bulk } = cu.doBuildTransform(exports);
      expect(transformObj).to.deep.equal({ errorHandlers: {} });
      expect(bulk).to.be.undefined;
    });

    it('empty', () => {
      const exports = {};
      const { transformObj, bulk } = cu.doBuildTransform(exports);
      expect(transformObj).to.deep.equal({ errorHandlers: {} });
      expect(bulk).to.be.undefined;
    });

    it('transform not a function (bulk)', () => {
      const exports = {
        transformBulk: [{ name: 'aaa|bbb', value: 'ERROR' }],
      };

      expect(() => cu.doBuildTransform(exports)).to.throw(
        'transformBulk must be a function'
      );
    });

    it('transform not a function (bySubject)', () => {
      const exports = {
        transformBySubject: [{ name: 'aaa|bbb', value: 'ERROR' }],
      };

      expect(() => cu.doBuildTransform(exports)).to.throw(
        'transformBySubject must be a function'
      );
    });

    it('by subject, errorHandlers', () => {
      const exports = {
        transformBySubject(ctx, aspects, subject, res) {
          return [{ name: 'aaa|bbb', value: '0' }];
        },

        errorHandlers: {
          404: function (ctx, aspects, subject, res) {
            return [{ name: 'aaa|bbb', value: 'ERROR' }];
          },

          500: function (ctx, aspects, subject, res) {
            return [{ name: 'aaa|bbb', value: 'ERROR' }];
          },
        },
      };

      const { transformObj, bulk } = cu.doBuildTransform(exports);
      expectCompressed(transformObj, exports);
      expect(bulk).to.be.false;
    });

    it('bulk, errorHandlers', () => {
      const exports = {
        transformBulk(ctx, aspects, subjects, res) {
          return [{ name: 'aaa|bbb', value: '0' }];
        },

        errorHandlers: {
          404: function (ctx, aspects, subjects, res) {
            return [{ name: 'aaa|bbb', value: 'ERROR' }];
          },

          500: function (ctx, aspects, subjects, res) {
            return [{ name: 'aaa|bbb', value: 'ERROR' }];
          },
        },
      };

      const { transformObj, bulk } = cu.doBuildTransform(exports);
      expectCompressed(transformObj, exports);
      expect(bulk).to.be.true;
    });

    it('errorHandlers, no default', () => {
      const exports = {
        errorHandlers: {
          404: function (ctx, aspects, subjects, res) {
            return [{ name: 'aaa|bbb', value: 'ERROR' }];
          },

          500: function (ctx, aspects, subjects, res) {
            return [{ name: 'aaa|bbb', value: 'ERROR' }];
          },
        },
      };

      const { transformObj, bulk } = cu.doBuildTransform(exports);
      expectCompressed(transformObj, exports);
      expect(bulk).to.be.true;
    });

    it('errorHandlers do not match default (bulk)', () => {
      const exports = {
        transformBulk(ctx, aspects, subjects, res) {
          return [{ name: 'aaa|bbb', value: '0' }];
        },

        errorHandlers: {
          404: function (ctx, aspects, subject, res) {
            return [{ name: 'aaa|bbb', value: 'ERROR' }];
          },

          500: function (ctx, aspects, subject, res) {
            return [{ name: 'aaa|bbb', value: 'ERROR' }];
          },
        },
      };

      expect(() => cu.doBuildTransform(exports)).to.throw(
        'Invalid function signature: "404" must have the same arguments as ' +
        'the corresponding "transformXXXXXX" function.'
      );
    });

    it('errorHandlers do not match default (bySubject)', () => {
      const exports = {
        transformBySubject(ctx, aspects, subject, res) {
          return [{ name: 'aaa|bbb', value: '0' }];
        },

        errorHandlers: {
          404: function (ctx, aspects, subject, res) {
            return [{ name: 'aaa|bbb', value: 'ERROR' }];
          },

          500: function (ctx, aspects, subjects, res) {
            return [{ name: 'aaa|bbb', value: 'ERROR' }];
          },
        },
      };

      expect(() => cu.doBuildTransform(exports)).to.throw(
        'Invalid function signature: "500" must have the same arguments as ' +
        'the corresponding "transformXXXXXX" function.'
      );
    });

    it('no default - errorHandlers do not match each other', () => {
      const exports = {
        errorHandlers: {
          404: function (ctx, aspects, subject, res) {
            return [{ name: 'aaa|bbb', value: 'ERROR' }];
          },

          500: function (ctx, aspects, subjects, res) {
            return [{ name: 'aaa|bbb', value: 'ERROR' }];
          },
        },
      };

      expect(() => cu.doBuildTransform(exports)).to.throw(
        'Invalid function signature: "500" must have the same arguments as ' +
        'the corresponding "transformXXXXXX" function.'
      );
    });

    it('errorHandler not a function', () => {
      const exports = {
        errorHandlers: {
          404: function (ctx, aspects, subject, res) {
            return [{ name: 'aaa|bbb', value: 'ERROR' }];
          },

          500: [{ name: 'aaa|bbb', value: 'ERROR' }],
        },
      };

      expect(() => cu.doBuildTransform(exports)).to.throw(
        'errorHandlers must be functions'
      );
    });

    it('with helpers', () => {
      const exports = {
        transformBulk(ctx, aspects, subjects, res) {
          return [{ name: generateSampleName('aaa', 'bbb'), value: '0' }];
        },

        errorHandlers: {
          404: function (ctx, aspects, subjects, res) {
            return [{ name: generateSampleName('aaa', 'bbb'), value: 'ERROR' }];
          },

          500: function (ctx, aspects, subjects, res) {
            return [{ name: generateSampleName('aaa', 'bbb'), value: 'ERROR' }];
          },
        },
        helpers: {
          generateSampleName(subject, aspect) {
            return `${subject.absolutePath}|${aspect.name}`;
          },
        },
      };

      const { transformObj, bulk } = cu.doBuildTransform(exports);
      expectCompressed(transformObj, exports);
      expect(bulk).to.be.true;
    });

    it('helper not a function', () => {
      const exports = {
        transformBulk(ctx, aspects, subjects, res) {
          return [{ name: generateSampleName('aaa', 'bbb'), value: '0' }];
        },

        errorHandlers: {
          404: function (ctx, aspects, subjects, res) {
            return [{ name: generateSampleName('aaa', 'bbb'), value: 'ERROR' }];
          },

          500: function (ctx, aspects, subjects, res) {
            return [{ name: generateSampleName('aaa', 'bbb'), value: 'ERROR' }];
          },
        },
        helpers: {
          generateSampleName: 'aaa.bbb|ccc',
        },
      };

      expect(() => cu.doBuildTransform(exports)).to.throw(
        'helpers must be functions'
      );
    });

    it('with contextDefinition (bulk)', () => {
      const exports = {
        transformBulk(ctx, aspects, subjects, res) {
          return [{ name: 'aaa|bbb', value: ctx.value }];
        },

        contextDefinition: {
          value: {
            description: 'value',
          },
        },
      };

      const { transformObj, bulk } = cu.doBuildTransform(exports);
      expectCompressed(transformObj, exports);
      expect(bulk).to.be.true;
    });

    it('with contextDefinition (bySubject)', () => {
      const exports = {
        transformBySubject(ctx, aspects, subject, res) {
          return [{ name: 'aaa|bbb', value: ctx.value }];
        },

        contextDefinition: {
          value: {
            description: 'value',
          },
        },
      };

      const { transformObj, bulk } = cu.doBuildTransform(exports);
      expectCompressed(transformObj, exports);
      expect(bulk).to.be.false;
    });

    it('validateCtxDef applied', () => {
      const exports = {
        transformBulk(ctx, aspects, subjects, res) {
          return [{ name: 'aaa|bbb', value: ctx.value }];
        },

        contextDefinition: {
          value: {},
        },
      };

      expect(() => cu.doBuildTransform(exports)).to.throw(
        'contextDefinition.value: description required'
      );
    });

    it('validateCtxUsages applied to all functions (default, bulk)', () => {
      const exports = {
        transformBulk(ctx, aspects, subjects, res) {
          return [{ name: 'aaa|bbb', value: ctx.value }];
        },

        errorHandlers: {
          404: function (ctx, aspects, subjects, res) {
            return [{ name: 'aaa|bbb', value: ctx.errValue }];
          },

          500: function (ctx, aspects, subjects, res) {
            return [{ name: 'aaa|bbb', value: ctx.errValue }];
          },
        },
        contextDefinition: {
          errValue: {
            description: 'errValue',
          },
        },
      };

      expect(() => cu.doBuildTransform(exports)).to.throw(
        'context variable "value" used in transformBulk is not defined in ' +
        'contextDefinition'
      );
    });

    it('validateCtxUsages applied to all functions (default, bySubject)', () => {
      const exports = {
        transformBySubject(ctx, aspects, subject, res) {
          return [{ name: 'aaa|bbb', value: ctx.value }];
        },

        errorHandlers: {
          404: function (ctx, aspects, subjects, res) {
            return [{ name: 'aaa|bbb', value: ctx.errValue }];
          },

          500: function (ctx, aspects, subjects, res) {
            return [{ name: 'aaa|bbb', value: ctx.errValue }];
          },
        },
        contextDefinition: {
          errValue: {
            description: 'errValue',
          },
        },
      };

      expect(() => cu.doBuildTransform(exports)).to.throw(
        'context variable "value" used in transformBySubject is not defined ' +
        'in contextDefinition'
      );
    });

    it('validateCtxUsages applied to all functions (errorHandlers)', () => {
      const exports = {
        transformBulk(ctx, aspects, subjects, res) {
          return [{ name: 'aaa|bbb', value: ctx.value }];
        },

        errorHandlers: {
          404: function (ctx, aspects, subjects, res) {
            return [{ name: 'aaa|bbb', value: ctx.errValue }];
          },

          500: function (ctx, aspects, subjects, res) {
            return [{ name: 'aaa|bbb', value: ctx.errValue }];
          },
        },
        contextDefinition: {
          value: {
            description: 'value',
          },
        },
      };

      expect(() => cu.doBuildTransform(exports)).to.throw(
        'context variable "errValue" used in 404 is not defined in ' +
        'contextDefinition'
      );
    });

    it('validateCtxUsages applied to all functions (errorHandlers 2)', () => {
      const exports = {
        transformBulk(ctx, aspects, subjects, res) {
          return [{ name: 'aaa|bbb', value: ctx.value }];
        },

        errorHandlers: {
          404: function (ctx, aspects, subjects, res) {
            return [{ name: 'aaa|bbb', value: ctx.errValue1 }];
          },

          500: function (ctx, aspects, subjects, res) {
            return [{ name: 'aaa|bbb', value: ctx.errValue2 }];
          },
        },
        contextDefinition: {
          value: {
            description: 'value',
          },
          errValue1: {
            description: 'errValue1',
          },
        },
      };

      expect(() => cu.doBuildTransform(exports)).to.throw(
        'context variable "errValue2" used in 500 is not defined in ' +
        'contextDefinition'
      );
    });

    it('default, errorHandlers, contextDefinition, helpers (bulk)', () => {
      const exports = {
        transformBulk(ctx, aspects, subjects, res) {
          return [{ name: generateSampleName('aaa', 'bbb'), value: ctx.val }];
        },

        errorHandlers: {
          404: function (ctx, aspects, subjects, res) {
            return [{ name: generateSampleName('aaa', 'bbb'), value: ctx.errVal }];
          },

          500: function (ctx, aspects, subjects, res) {
            return [{ name: generateSampleName('aaa', 'bbb'), value: ctx.errVal }];
          },
        },

        contextDefinition: {
          val: {
            description: 'value',
          },
          errVal: {
            description: 'errVal',
          },
        },

        helpers: {
          generateSampleName(subject, aspect) {
            return `${subject.absolutePath}|${aspect.name}`;
          },
        },
      };

      const { transformObj, bulk } = cu.doBuildTransform(exports);
      expectCompressed(transformObj, exports);
      expect(bulk).to.be.true;
    });

    it('default, errorHandlers, contextDefinition, helpers (bySubject)', () => {
      const exports = {
        transformBySubject(ctx, aspects, subject, res) {
          return [{ name: generateSampleName('aaa', 'bbb'), value: ctx.val }];
        },

        errorHandlers: {
          404: function (ctx, aspects, subject, res) {
            return [{ name: generateSampleName('aaa', 'bbb'), value: ctx.errVal }];
          },

          500: function (ctx, aspects, subject, res) {
            return [{ name: generateSampleName('aaa', 'bbb'), value: ctx.errVal }];
          },
        },

        contextDefinition: {
          val: {
            description: 'value',
          },
          errVal: {
            description: 'errVal',
          },
        },

        helpers: {
          generateSampleName(subject, aspect) {
            return `${subject.absolutePath}|${aspect.name}`;
          },
        },
      };

      const { transformObj, bulk } = cu.doBuildTransform(exports);
      expectCompressed(transformObj, exports);
      expect(bulk).to.be.false;
    });
  });

  describe('checkConflictingCtxDefs >', () => {
    function mock(mockConnectionCtxDef, mockTransformCtxDef) {
      const mockConnection = {
        contextDefinition: mockConnectionCtxDef,
      };
      const mockTransform = {
        contextDefinition: mockTransformCtxDef,
      };
      mockRequire('../../connection/connection.js', mockConnection);
      mockRequire('../../transform/transform.js', mockTransform);
    }

    const mockCtxDef = {
      ctx1: {
        description: 'ctx1',
        required: true,
      },
      ctx2: {
        description: 'ctx2',
        required: false,
        default: '2',
      },
      ctx3: {
        description: 'ctx3',
        required: false,
      },
    };

    it('empty ok', () => {
      const mockConnectionCtxDef = {
        ctx1: mockCtxDef.ctx3,
      };
      const mockTransformCtxDef = {};

      mock(mockConnectionCtxDef, mockTransformCtxDef);
      expect(() => cu.checkConflictingCtxDefs()).to.not.throw();
    });

    it('no overlap ok', () => {
      const mockConnectionCtxDef = {
        ctx1: mockCtxDef.ctx1,
      };
      const mockTransformCtxDef = {
        ctx2: mockCtxDef.ctx2,
      };

      mock(mockConnectionCtxDef, mockTransformCtxDef);
      expect(() => cu.checkConflictingCtxDefs()).to.not.throw();
    });

    it('shared variables ok', () => {
      const mockConnectionCtxDef = {
        ctx1: mockCtxDef.ctx1,
        ctx2: mockCtxDef.ctx2,
      };
      const mockTransformCtxDef = {
        ctx2: mockCtxDef.ctx2,
        ctx3: mockCtxDef.ctx3,
      };

      mock(mockConnectionCtxDef, mockTransformCtxDef);
      expect(() => cu.checkConflictingCtxDefs()).to.not.throw();
    });

    it('exact match ok', () => {
      const mockConnectionCtxDef = JSON.parse(JSON.stringify(mockCtxDef));
      const mockTransformCtxDef = JSON.parse(JSON.stringify(mockCtxDef));
      mock(mockConnectionCtxDef, mockTransformCtxDef);
      expect(() => cu.checkConflictingCtxDefs()).to.not.throw();
    });

    it('conflicting description', () => {
      const mockConnectionCtxDef = JSON.parse(JSON.stringify(mockCtxDef));
      const mockTransformCtxDef = JSON.parse(JSON.stringify(mockCtxDef));
      mockTransformCtxDef.ctx1 = 'ctx1...';
      mock(mockConnectionCtxDef, mockTransformCtxDef);
      expect(() => cu.checkConflictingCtxDefs()).to.throw(
        'contextDefinition.ctx1: conflicting definitions in transform.js and ' +
        'connection.js'
      );
    });

    it('conflicting required', () => {
      const mockConnectionCtxDef = JSON.parse(JSON.stringify(mockCtxDef));
      const mockTransformCtxDef = JSON.parse(JSON.stringify(mockCtxDef));
      delete mockTransformCtxDef.ctx2.required;
      mock(mockConnectionCtxDef, mockTransformCtxDef);
      expect(() => cu.checkConflictingCtxDefs()).to.throw(
        'contextDefinition.ctx2: conflicting definitions in transform.js and ' +
        'connection.js'
      );
    });

    it('conflicting default', () => {
      const mockConnectionCtxDef = JSON.parse(JSON.stringify(mockCtxDef));
      const mockTransformCtxDef = JSON.parse(JSON.stringify(mockCtxDef));
      mockConnectionCtxDef.ctx2.default = '3';
      mock(mockConnectionCtxDef, mockTransformCtxDef);
      expect(() => cu.checkConflictingCtxDefs()).to.throw(
        'contextDefinition.ctx2: conflicting definitions in transform.js and ' +
        'connection.js'
      );
    });
  });

  describe('isBulk >', () => {
    it('bulk', () => {
      function transform(ctx, aspects, subjects, res) {
        return [{ name: 'aaa|bbb', value: '0' }];
      }

      expect(cu.isBulk(transform.toString())).to.be.true;
    });

    it('by subject', () => {
      function transform(ctx, aspects, subject, res) {
        return [{ name: 'aaa|bbb', value: '0' }];
      }

      expect(cu.isBulk(transform.toString())).to.be.false;
    });

    it('by subject, order doesnt matter', () => {
      function transform(subject, ctx, aspects, res) {
        return [{ name: 'aaa|bbb', value: '0' }];
      }

      expect(cu.isBulk(transform.toString())).to.be.false;
    });

    it('no subj arg, error', () => {
      function transform(ctx, aspects, res) {
        return [{ name: 'aaa|bbb', value: '0' }];
      }

      expect(() => cu.isBulk(transform.toString())).to.throw();
    });

    it('subj outside of args, error', () => {
      function subject(ctx, aspects, res) { return subjects; }

      expect(() => cu.isBulk(subject.toString())).to.throw();
    });

    it('empty args, error', () => {
      function transform() {
        return [{ name: 'aaa|bbb', value: '0' }];
      }

      expect(() => cu.isBulk(transform.toString())).to.throw();
    });

    it('no args, error', () => {
      const code = 'transform';
      expect(() => cu.isBulk(code)).to.throw();
    });

    it('empty, error', () => {
      const code = '';
      expect(() => cu.isBulk(code)).to.throw();
    });
  });

  describe('compress >', () => {
    it('default form', () => {
      const transform = {
        transformBulk(ctx, aspects, subjects, res) {
          const samples = [];
          let sampleCount = 0;
          subjects.forEach((subject) => {
            aspects.forEach((aspect) => {
              sampleCount++;
              samples.push({
                name: `${subject.absolutePath}|${aspect.name}`,
                value: res[subject.absolutePath].tests[aspect.name].value,
                messageCode: '0000',
                messageBody: `this is sample number ${sampleCount}`,
              });
            });
          });
        },

        helpers: {},
      };

      const code = transform.transformBulk.toString();
      const helpers = transform.helpers;
      expect(cu.compress(code, helpers)).to.equal(
        'const e=[];let a=0;subjects.forEach(subject=>{aspects.forEach(aspect' +
        '=>{a++,e.push({name:`${subject.absolutePath}|${aspect.name}`,value:r' +
        "es[subject.absolutePath].tests[aspect.name].value,messageCode:'0000'" +
        ',messageBody:`this is sample number ${a}`})})})'
      );
    });

    it('errorHandler form', () => {
      const transform = {
        errorHandlers: {
          404: function (ctx, aspects, subject, res) {
            return aspects.map((aspect) => ({
              name: `${subject.absolutePath}|${aspect.name}`,
              value: 'ERROR',
              messageCode: 'ERROR',
              messageBody: 'got 404 error...',
            }));
          },
        },
        helpers: {},
      };

      const code = transform.errorHandlers[404].toString();
      const helpers = transform.helpers;
      expect(cu.compress(code, helpers)).to.equal(
        'return aspects.map(aspect=>({name:`${subject.absolutePath}|${aspect.' +
        "name}`,value:'ERROR',messageCode:'ERROR',messageBody:'got 404 error." +
        "..'}))"
      );
    });

    it('arrow form', () => {
      const transform = {
        errorHandlers: {
          404: (ctx, aspects, subject, res) => {
            const samples = aspects.map((aspect) => ({
              name: `${subject.absolutePath}|${aspect.name}`,
              value: 'ERROR',
              messageCode: 'ERROR',
              messageBody: 'got 404 error...',
            }));
            return samples;
          },
        },
        helpers: {},
      };

      const code = transform.errorHandlers[404].toString();
      const helpers = transform.helpers;
      expect(cu.compress(code, helpers)).to.equal(
        'return aspects.map(aspect=>({name:`${subject.absolutePath}|${aspect.' +
        "name}`,value:'ERROR',messageCode:'ERROR',messageBody:'got 404 error." +
        "..'}))"
      );
    });

    it('helpers attached to beginning', () => {
      const transform = {
        transformBulk(ctx, aspects, subjects, res) {
          return [
            {
              name: generateSampleName(subjects[0], aspects[0]),
              value: '1',
              messageCode: '0000',
              messageBody: truncateMessage(aspects[0].description, 5),
            },
            {
              name: generateSampleName(subjects[1], aspects[0]),
              value: '2',
              messageCode: '0000',
              messageBody: truncateMessage(aspects[0].description, 5),
            },
          ];
        },

        helpers: {
          generateSampleName(subject, aspect) {
            return `${subject.absolutePath}|${aspect.name}`;
          },

          truncateMessage(msg, max = 4096) {
            if (msg.length > max) {
              return msg.substring(0, max - 3) + '...';
            } else {
              return msg;
            }
          },
        },
      };

      const code = transform.transformBulk.toString();
      const helpers = transform.helpers;
      expect(cu.compress(code, helpers)).to.equal(
        'function e(subject,aspect){return`${subject.absolutePath}|${aspect.n' +
        "ame}`}function n(e,n=4096){return e.length>n?e.substring(0,n-3)+'..." +
        "':e}return[{name:e(subjects[0],aspects[0]),value:'1',messageCode:'00" +
        "00',messageBody:n(aspects[0].description,5)},{name:e(subjects[1],asp" +
        "ects[0]),value:'2',messageCode:'0000',messageBody:n(aspects[0].descr" +
        'iption,5)}]'
      );
    });

    it('helpers substituted in-place if possible', () => {
      const transform = {
        transformBySubject(ctx, aspects, subject, res) {
          return aspects.map((aspect) => ({
            name: generateSampleName(subject, aspect),
            value: res.tests[aspect.name].value,
            messageCode: '0000',
            messageBody: truncateMessage(aspects.description, 5),
          }));
        },

        helpers: {
          generateSampleName(subject, aspect) {
            return `${subject.absolutePath}|${aspect.name}`;
          },

          truncateMessage(msg, max = 4096) {
            if (msg.length > max) {
              return msg.substring(0, max - 3) + '...';
            } else {
              return msg;
            }
          },
        },
      };

      const code = transform.transformBySubject.toString();
      const helpers = transform.helpers;
      expect(cu.compress(code, helpers)).to.equal(
        'return aspects.map(aspect=>({name:function(subject,aspect){return`${' +
        'subject.absolutePath}|${aspect.name}`}(subject,aspect),value:res.tes' +
        "ts[aspect.name].value,messageCode:'0000',messageBody:function(e,n=40" +
        "96){return e.length>n?e.substring(0,n-3)+'...':e}(aspects.descriptio" +
        'n,5)}))'
      );
    });

    it('helpers within helpers', () => {
      const transform = {
        transformBySubject(ctx, aspects, subject, res) {
          return aspects.map((aspect) => generateSample(subject, aspect, res));
        },

        helpers: {
          generateSample(subject, aspect, res) {
            return {
              name: generateSampleName(subject, aspect),
              value: res.tests[aspect.name].value,
              messageCode: '0000',
              messageBody: truncateMessage(aspect.description, 5),
            };
          },

          generateSampleName(subject, aspect) {
            return `${subject.absolutePath}|${aspect.name}`;
          },

          truncateMessage(msg, max = 4096) {
            if (msg.length > max) {
              return msg.substring(0, max - 3) + '...';
            } else {
              return msg;
            }
          },
        },
      };

      const code = transform.transformBySubject.toString();
      const helpers = transform.helpers;
      expect(cu.compress(code, helpers)).to.equal(
        'return aspects.map(aspect=>(function(subject,aspect,res){return{name' +
        ':function(subject,aspect){return`${subject.absolutePath}|${aspect.na' +
        'me}`}(subject,aspect),value:res.tests[aspect.name].value,messageCode' +
        ":'0000',messageBody:function(e,n=4096){return e.length>n?e.substring" +
        "(0,n-3)+'...':e}(aspect.description,5)}})(subject,aspect,res))"
      );
    });

    it('unused helpers are not attached', () => {
      const transform = {
        transformBySubject(ctx, aspects, subject, res) {
          let sampleCount = 0;
          return aspects.map((aspect) => ({
            name: `${subject.absolutePath}|${aspect.name}`,
            value: res.tests[aspect.name].value,
            messageCode: '0000',
            messageBody: `this is sample number ${sampleCount++}`,
          }));
        },

        helpers: {
          generateSampleName(subject, aspect) {
            return `${subject.absolutePath}|${aspect.name}`;
          },

          truncateMessage(msg, max = 4096) {
            if (msg.length > max) {
              return msg.substring(0, max - 3) + '...';
            } else {
              return msg;
            }
          },
        },
      };

      const code = transform.transformBySubject.toString();
      const helpers = transform.helpers;
      expect(cu.compress(code, helpers)).to.equal(
        'let e=0;return aspects.map(aspect=>({name:`${subject.absolutePath}|$' +
        "{aspect.name}`,value:res.tests[aspect.name].value,messageCode:'0000'" +
        ',messageBody:`this is sample number ${e++}`}))'
      );
    });

    it('alternate helper forms', () => {
      const transform = {
        transformBySubject(ctx, aspects, subject, res) {
          return aspects.map((aspect) => ({
            name: generateSampleName(subject, aspect),
            value: res.tests[aspect.name].value,
            messageCode: '0000',
            messageBody: truncateMessage(aspects.description, 5),
          }));
        },

        helpers: {
          generateSampleName: function (subject, aspect) {
            return `${subject.absolutePath}|${aspect.name}`;
          },

          truncateMessage: (msg, max = 4096) => {
            if (msg.length > max) {
              return msg.substring(0, max - 3) + '...';
            } else {
              return msg;
            }
          },
        },
      };

      const code = transform.transformBySubject.toString();
      const helpers = transform.helpers;
      expect(cu.compress(code, helpers)).to.equal(
        'return aspects.map(aspect=>({name:function(subject,aspect){return`${' +
        'subject.absolutePath}|${aspect.name}`}(subject,aspect),value:res.tes' +
        "ts[aspect.name].value,messageCode:'0000',messageBody:function(e,n=40" +
        "96){return e.length>n?e.substring(0,n-3)+'...':e}(aspects.descriptio" +
        'n,5)}))'
      );
    });
  });

  describe('validateCtxUsages >', () => {
    const ctxDef = {
      s1: { description: 's1', },
      s2: { description: 's2', },
      s3: { description: 's3', },
      a: { description: 'a', },
      value: { description: 'value', },
      msgCode: { description: 'msgCode', },
      msgBody: { description: 'msgBody', },
    };

    it('no usages, no ctx', () => {
      function transformBySubject(ctx, aspects, subject, res) {
        return aspects.map((a) => ({
          name: `${subject.absolutePath}|${a.name}`,
          value: '0',
        }));
      };

      const code = transformBySubject.toString();
      const fName = 'transformBySubject';
      expect(() => cu.validateCtxUsages(code, {}, fName)).to.not.throw();
    });

    it('basic usage', () => {
      function transformBySubject(ctx, aspects, subject, res) {
        return aspects.map((a) => ({
          name: `${subject.absolutePath}|${a.name}`,
          value: ctx.value,
        }));
      };

      const code = transformBySubject.toString();
      const fName = 'transformBySubject';
      expect(() => cu.validateCtxUsages(code, ctxDef, fName)).to.not.throw();
      expect(() => cu.validateCtxUsages(code, {}, fName)).to.throw(
        'context variable "value" used in transformBySubject is not defined in ' +
        'contextDefinition'
      );
    });

    it('basic usage, multiple', () => {
      function transformBySubject(ctx, aspects, subject, res) {
        return aspects.map((a) => ({
          name: `${ctx.s1}.${ctx.s2}.${ctx.s3}|${ctx.a}`,
          value: ctx.value,
        }));
      };

      const code = transformBySubject.toString();
      const fName = 'transformBySubject';
      const ctxDef = {
        s1: 's1',
        s3: 's3',
        msgCode: 'msgCode',
      };
      expect(() => cu.validateCtxUsages(code, ctxDef, fName)).to.throw(
        'context variables [s2,a,value] used in transformBySubject are ' +
        'not defined in contextDefinition'
      );
    });

    it('dot notation weird spaces', () => {
      function transformBySubject(ctx, aspects, subject, res) {
        return aspects.map((a) => ({
          name: `${ctx . s1}.${ctx. s2}.${ctx .s3}|${ctx     .  a}`,
          value: ctx.
            value,
          messageCode: ctx
            .msgCode,
          messageBody: ctx
            .
            msgBody,
        }));
      };

      const code = transformBySubject.toString();
      const fName = 'transformBySubject';
      expect(() => cu.validateCtxUsages(code, ctxDef, fName)).to.not.throw();
      expect(() => cu.validateCtxUsages(code, {}, fName)).to.throw(
        'context variables [s1,s2,s3,a,value,msgCode,msgBody] used in ' +
        'transformBySubject are not defined in contextDefinition'
      );
    });

    // jscs:disable requireDotNotation
    it('bracket notation weird spaces', () => {
      function transformBySubject(ctx, aspects, subject, res) {
        return aspects.map((a) => ({
          name: `${ctx['s1']}.${ctx['s2']}.${ctx[`s3`]}|${ctx ['a']}`,
          value: ctx[
            'value'],
          messageCode: ctx['msgCode'
            ],
          messageBody: ctx[
            'msgBody'
          ],
        }));
      };

      // jscs:enable requireDotNotation

      const code = transformBySubject.toString();
      const fName = 'transformBySubject';
      expect(() => cu.validateCtxUsages(code, ctxDef, fName)).to.not.throw();
      expect(() => cu.validateCtxUsages(code, {}, fName)).to.throw(
        'context variables [s1,s2,s3,a,value,msgCode,msgBody] used in ' +
        'transformBySubject are not defined in contextDefinition'
      );
    });

    it('bracket notation with variables', () => {
      function transformBySubject(ctx, aspects, subject, res) {
        const s1 = 's1';
        const s2 = 's2';
        const s3 = 's3';
        const a = 'a';
        const value = 'value';
        const msgCode = 'msgCode';
        const msgBody = 'msgBody';
        return aspects.map((a) => ({
          name: `${ctx[s1]}.${ctx[s2]}.${ctx[s3]}|${ctx [a]}`,
          value: ctx[
            value],
          messageCode: ctx[msgCode
            ],
          messageBody: ctx[
            msgBody
            ],
        }));
      };

      const code = transformBySubject.toString();
      const fName = 'transformBySubject';
      expect(() => cu.validateCtxUsages(code, ctxDef, fName)).to.not.throw();
      expect(() => cu.validateCtxUsages(code, {}, fName)).to.throw(
        'context variables [s1,s2,s3,a,value,msgCode,msgBody] used in ' +
        'transformBySubject are not defined in contextDefinition'
      );
    });

    /*
      validateContextUsages will not work for bracket notation with advanced
      evaluations, since it relies on regex. If you try to do that in the
      transform it will throw an error. The following test has some examples
      of what won't work.

      I think this is fine, since accessing properties this way is rare and
      never necessary. If it's an issue in the future we can just remove this
      function - its nice to have to catch issues before runtime, but not
      necessary.
    */
    it.skip('advanced bracket notation that cannot be detected by regex', () => {
      function transformBySubject(ctx, aspects, subject, res) {
        const s1 = 's1';
        const s2 = 's2';
        const a = 'aaa';
        const values = ['value0', 'value1'];
        const msgCodes = { code1: 'msgCode1', code2: 'msgCode2' };
        const msgBody = () => 'msgBody';
        return aspects.map((a) => ({
          name: `${ctx['s' + '1']}.${ctx[`${s2}`]}|${ctx[a.substr(0, 1)]}`,
          value: ctx[values[0]],
          messageCode: ctx[msgCodes.code1],
          messageBody: ctx[msgBody()],
        }));
      };

      const code = transformBySubject.toString();
      const fName = 'transformBySubject';
      expect(() => cu.validateCtxUsages(code, ctxDef, fName)).to.not.throw();
      expect(() => cu.validateCtxUsages(code, {}, fName)).to.throw(
        'context variables [s1,s2,a,value,msgCode,msgBody] used in ' +
        'transformBySubject are not defined in contextDefinition'
      );
    });
  });

  describe('validateCtxDef >', () => {
    it('not an object', () => {
      const ctxDef = 'ctxDef';
      expect(() => cu.validateCtxDef(ctxDef)).to.throw(
        'contextDefinition must be an object'
      );
    });

    it('value not an object', () => {
      const ctxDef = {
        ctx1: {
          description: 'ctx1',
        },
        ctx2: 'ctx2',
      };
      expect(() => cu.validateCtxDef(ctxDef)).to.throw(
        'contextDefinition values must be objects'
      );
    });

    it('description only', () => {
      const ctxDef = {
        ctx1: {
          description: 'ctx1',
        },
      };
      expect(() => cu.validateCtxDef(ctxDef)).to.not.throw();
    });

    it('no description (error)', () => {
      const ctxDef = {
        ctx1: {
          required: true,
        },
      };
      expect(() => cu.validateCtxDef(ctxDef)).to.throw(
        'contextDefinition.ctx1: description required'
      );
    });

    it('required', () => {
      const ctxDef = {
        ctx1: {
          description: 'ctx1',
          required: true,
        },
      };
      expect(() => cu.validateCtxDef(ctxDef)).to.not.throw();
    });

    it('not required', () => {
      const ctxDef = {
        ctx1: {
          description: 'ctx1',
          required: false,
        },
      };
      expect(() => cu.validateCtxDef(ctxDef)).to.not.throw();
    });

    it('required, default specified (error)', () => {
      const ctxDef = {
        ctx1: {
          description: 'ctx1',
          required: true,
          default: 'ctx1',
        },
      };
      expect(() => cu.validateCtxDef(ctxDef)).to.throw(
        'contextDefinition.ctx1: default not needed if required is true'
      );
    });

    it('not required, default specified', () => {
      const ctxDef = {
        ctx1: {
          description: 'ctx1',
          required: false,
          default: 'ctx1',
        },
      };
      expect(() => cu.validateCtxDef(ctxDef)).to.not.throw();
    });

    it('multiple keys - all valid', () => {
      const ctxDef = {
        ctx1: {
          description: 'ctx1',
          required: false,
          default: 'ctx1',
        },
        ctx2: {
          description: 'ctx2',
          required: true,
        },
        ctx3: {
          description: 'ctx3',
          required: false,
        },
      };
      expect(() => cu.validateCtxDef(ctxDef)).to.not.throw();
    });

    it('multiple keys - first invalid key throws error', () => {
      const ctxDef = {
        ctx1: {
          description: 'ctx1',
          required: false,
          default: 'ctx1',
        },
        ctx2: {
          required: true,
          default: 'ctx2',
        },
        ctx3: {
          description: 'ctx3',
          required: true,
          default: 'ctx3',
        },
      };
      expect(() => cu.validateCtxDef(ctxDef)).to.throw(
        'contextDefinition.ctx2: description required'
      );
    });
  });
});
