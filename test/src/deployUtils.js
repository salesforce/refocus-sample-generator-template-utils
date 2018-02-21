/**
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * test/src/deployUtils.js
 */
const expect = require('chai').expect;
const du = require('../../src/deployUtils');
const mockFs = require('mock-fs');
const path = require('path');
const fs = require('fs-extra');
const nock = require('nock');

describe('test/src/deployUtils.js >', () => {
  const templateFile = `./my-project/my-project.json`;
  const url = 'http://example.com';
  const token = 'abcdefg';
  const mockSGT = {
    name: 'my-project',
    version: '1.0.0',
    description: '',
    tags: [
      'my-sgt',
    ],
    author: '',
    connection: {
      url: 'http://example.com',
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    },
    contextDefinition: {},
    transform: {
      default: 'return [{ name: `${subjects[0]}|${aspects[0]`, value: "0"}]',
      errorHandlers: {},
    },
  };

  before(() => {
    mockFs({
      './my-project': {
        'my-project.json': JSON.stringify(mockSGT),
      },
    });
  });
  after(() => {
    mockFs.restore();
  });

  it('deploy - template string', () => {
    nock(url)
    .post('/v1/generatortemplates')
    .reply(201);

    return du.deploy(templateFile, url, token)
    .then((res) => {
      expect(res.statusCode).to.equal(201);
      expect(nock.isDone()).to.be.true;
    });
  });

  it('deploy - template object', () => {
    nock(url)
    .post('/v1/generatortemplates')
    .reply(201);

    return du.deploy(mockSGT, url, token)
    .then((res) => {
      expect(res.statusCode).to.equal(201);
      expect(nock.isDone()).to.be.true;
    });
  });
});
