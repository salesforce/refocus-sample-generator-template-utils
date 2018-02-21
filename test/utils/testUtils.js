/**
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * test/utils/testUtils.js
 */
const expect = require('chai').expect;
const fs = require('fs-extra');
const projectName = 'reserved-project-name-for-automated-tests';
const fork = require('child_process').fork;
let tu;

describe('test/utils/testUtils.js >', function () {
  this.timeout(3000);

  function setup(transformExample, connectionExample) {
    fs.removeSync(`./${projectName}`);
    return new Promise((resolve) => {
      const args = [projectName];
      if (transformExample) args.push('-t', transformExample);
      if (connectionExample) args.push('-c', connectionExample);
      const forkedProcess = fork('./bin/generateResources.js', args);
      forkedProcess.on('close', () => {
        process.chdir(`./${projectName}`);
        tu = require(`../../${projectName}/utils/testUtils`);
        resolve();
      });
    });
  }

  function setupAndBuild(transformExample, connectionExample) {
    return setup(transformExample, connectionExample)
    .then(() => {
      if (transformExample) return tu.buildTransform();
    })
    .then(() => {
      if (connectionExample) return tu.buildConnection();
    });
  }

  function removeProject() {
    process.chdir('..');
    fs.removeSync(`./${projectName}`);
  }

  describe('assignContext >', () => {
    before(() => setup());
    after(removeProject);

    it('context variables are assigned correctly', () => {
      const ctxDef = {
        ctx1: {
          description: 'ctx1',
          required: true,
        },
        ctx2: {
          description: 'ctx2',
          required: false,
        },
        ctx3: {
          description: 'ctx3',
          required: false,
          default: '3',
        },
      };
      const ctx = {
        ctx1: '1',
      };

      tu.assignContext(ctx, ctxDef);
      expect(ctx).to.have.property('ctx1', '1');
      expect(ctx).to.not.have.property('ctx2');
      expect(ctx).to.have.property('ctx3', '3');
    });

    it('context includes a variable that is not defined (error)', () => {
      const ctxDef = {
        ctx1: {
          description: 'ctx1',
          required: true,
        },
        ctx2: {
          description: 'ctx2',
          required: false,
          default: '2',
        },
      };
      const ctx = {
        ctx1: '1',
        ctx2: '2',
        ctx3: '3',
      };

      expect(() => tu.assignContext(ctx, ctxDef)).to.throw(
        'context variable "ctx3" was passed to the function but is not ' +
        'defined in the contextDefinition'
      );
    });

    it('required variable not included in context (error)', () => {
      const ctxDef = {
        ctx1: {
          description: 'ctx1',
          required: true,
        },
        ctx2: {
          description: 'ctx2',
          required: false,
          default: '2',
        },
      };
      const ctx = {
        ctx2: '2',
      };

      expect(() => tu.assignContext(ctx, ctxDef)).to.throw(
        `contextDefinition.ctx1 is marked as required but was not included ` +
        `when calling this function`
      );
    });

    it('ctxDef undefined - no changes', () => {
      const ctxDef = undefined;
      const ctx = {
        ctx1: '1',
      };

      tu.assignContext(ctx, ctxDef);
      expect(ctx).to.have.keys('ctx1');
    });

    it('ctx undefined - no changes', () => {
      const ctxDef = {
        ctx1: {
          description: 'ctx1',
          required: true,
        },
        ctx2: {
          description: 'ctx2',
          required: false,
          default: '2',
        },
      };
      const ctx = undefined;

      tu.assignContext(ctx, ctxDef);
      expect(ctx).to.be.undefined;
    });
  });

  describe('buildTransform >', () => {
    before(() => setup('mockBulk', null));
    after(removeProject);

    it('sgtu-build-transform is executed', () => {
      const sgt = fs.readJsonSync(`./${projectName}.json`);
      expect(sgt.transform.default).to.be.empty;
      return tu.buildTransform()
      .then(() => {
        const sgt = fs.readJsonSync(`./${projectName}.json`);
        expect(sgt.transform.default).to.not.be.empty;
      });
    });
  });

  describe('buildConnection >', () => {
    before(() => setup(null, 'basicSubstitution'));
    after(removeProject);

    it('sgtu-build-connection is executed', () => {
      const sgt = fs.readJsonSync(`./${projectName}.json`);
      expect(sgt.connection).to.not.have.property('url');
      return tu.buildConnection()
      .then(() => {
        const sgt = fs.readJsonSync(`./${projectName}.json`);
        expect(sgt.connection).to.have.property('url');
        expect(sgt.contextDefinition).to.have.keys(
          'baseUrl', 'window', 'type', 'subtype'
        );
      });
    });
  });

  describe('prepareUrl >', () => {
    before(() => setupAndBuild(null, 'basicSubstitution'));
    after(removeProject);

    it('rce.prepareUrl is called with assigned context', () => {
      const sgt = fs.readJsonSync(`./${projectName}.json`);
      const ctx = {
        baseUrl: 'example.com',
      };
      const preparedUrl = tu.prepareUrl(ctx);
      expect(preparedUrl).to.equal(
        'https://example.com?expression=-15m:subjects:all:tests:all'
      );
    });
  });

  describe('prepareHeaders >', () => {
    before(() => setupAndBuild(null, 'basicSubstitution'));
    after(removeProject);

    it('rce.prepareHeaders is called with assigned context', () => {
      const ctx = {
        baseUrl: 'example.com',
        subtype: 'xml',
      };
      const preparedHeaders = tu.prepareHeaders(ctx);
      expect(preparedHeaders).to.deep.equal({ Accept: 'text/xml' });
    });
  });

  describe('doTransform >', () => {
    afterEach(removeProject);

    it('bulk', function () {
      return setupAndBuild('mockBulk', null)
      .then(() => {
        const ctx = {};
        const aspects = [
          {
            name: 'aspect1',
            timeout: '5m',
          },
        ];
        const subjects = [
          { absolutePath: 'aaa.bbb' },
          { absolutePath: 'aaa.ccc' },
        ];
        const res = {};

        const samples = tu.doTransform(ctx, aspects, subjects, res);
        expect(samples).to.have.lengthOf(2);
        expect(samples[0]).to.have.property('name', 'aaa.bbb|aspect1');
        expect(samples[1]).to.have.property('name', 'aaa.ccc|aspect1');
        expect(samples[0]).to.have.property('messageBody', 'this is mock sample 1');
        expect(samples[1]).to.have.property('messageBody', 'this is mock sample 2');
      });
    });

    it('bySubject', function () {
      return setupAndBuild('mockBySubject', null)
      .then(() => {
        const ctx = {};
        const aspects = [
          {
            name: 'aspect1',
            timeout: '5m',
          },
        ];
        const subject = { absolutePath: 'aaa.bbb' };
        const res = {};

        const samples = tu.doTransform(ctx, aspects, subject, res);
        expect(samples).to.have.lengthOf(1);
        expect(samples[0]).to.have.property('name', 'aaa.bbb|aspect1');
        expect(samples[0]).to.have.property('messageBody', 'this is mock sample 1');
      });
    });

    it('bulk args mismatch (error)', function () {
      return setupAndBuild('mockBulk', null)
      .then(() => {
        const ctx = {};
        const aspects = [
          {
            name: 'aspect1',
            timeout: '5m',
          },
        ];
        const subject = { absolutePath: 'aaa.bbb' };
        const res = {};

        expect(() => tu.doTransform(ctx, aspects, subject, res)).to.throw(
          'Must include a "subjects" attribute with an array of one or more ' +
          'subjects'
        );
      });
    });

    it('error handlers', function () {
      return setupAndBuild('errorHandlersBySubject', null)
      .then(() => {
        const ctx = {};
        const aspects = [
          {
            name: 'aspect1',
            timeout: '5m',
          },
        ];
        const subject = { absolutePath: 'aaa.bbb' };
        const res = { statusCode: 400 };

        const samples = tu.doTransform(ctx, aspects, subject, res);
        expect(samples).to.have.lengthOf(1);
        expect(samples[0]).to.have.property('name', 'aaa.bbb|aspect1');
        expect(samples[0]).to.have.property('messageBody', 'got 400 error...');
      });
    });

    it('randomNumbers - context is assigned', function () {
      return setupAndBuild('randomNumbers', null)
      .then(() => {
        const ctx = {
          alternateMessageCode: '...',
        };
        const aspects = [
          {
            name: 'aspect1',
            timeout: '5m',
          },
        ];
        const subjects = [
          { absolutePath: 'aaa.bbb' },
          { absolutePath: 'aaa.ccc' },
        ];
        const res = {
          text: '1\n222222',
        };

        const samples = tu.doTransform(ctx, aspects, subjects, res);
        expect(samples).to.have.lengthOf(2);
        expect(samples[0]).to.have.property('name', 'aaa.bbb|aspect1');
        expect(samples[1]).to.have.property('name', 'aaa.ccc|aspect1');
        expect(samples[0]).to.have.property('value', '1');
        expect(samples[1]).to.have.property('value', '222222');
        expect(samples[0]).to.have.property('messageCode', '1');
        expect(samples[1]).to.have.property('messageCode', '...');
      });
    });
  });
});

