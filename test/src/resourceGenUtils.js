/**
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or
 * https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * test/src/resourceGenUtils.js
 */
const expect = require('chai').expect;
const rgu = require('../../src/resourceGenUtils');
const mockFs = require('mock-fs');
const path = require('path');
const fs = require('fs-extra');
const projectName = 'reserved-project-name-for-automated-tests';

describe('test/src/resourceGenUtils.js >', () => {

  function mockDir(path1) {
    const dir = {};
    fs.readdirSync(path1).forEach((filename) => {
      const path2 = path.resolve(path1, filename);
      if (fs.statSync(path2).isDirectory()) {
        dir[filename] = mockDir(path2);
      } else {
        dir[filename] = fs.readFileSync(path2);
      }
    });
    return dir;
  }

  function expectFilesEqual(path1, path2) {
    expect(fs.existsSync(path1)).to.be.true;
    expect(fs.existsSync(path2)).to.be.true;
    const file1 = fs.readFileSync(path1).toString();
    const file2 = fs.readFileSync(path2).toString();
    expect(file1).to.equal(file2);
  }

  describe('createDir >', () => {
    before(() => mockFs());
    after(() => mockFs.restore());

    it('new directory is created', () => {
      expect(fs.existsSync('./my-project')).to.be.false;
      rgu.createDir('my-project');
      expect(fs.existsSync('./my-project')).to.be.true;
    });

    it('invalid name (warning)', () => {
      expect(fs.existsSync('MyProject')).to.be.false;
      expect(() => rgu.createDir('MyProject'))
      .to.throw('name can no longer contain capital letters');
    });

    it('invalid name (error)', () => {
      expect(fs.existsSync('MyProject')).to.be.false;
      expect(() => rgu.createDir(''))
      .to.throw('name length must be greater than zero');
    });
  });

  describe('copyPrototype >', () => {
    beforeEach(() => mockFs({
      'my-project': {},
      prototype: mockDir('./prototype'),
      examples: {
        connection: {
          basic: mockDir('./examples/connection/basic'),
        },
        transform: {
          basicBulk: mockDir('./examples/transform/basicBulk'),
        },
      },
    }));
    afterEach(() => mockFs.restore());

    it('prototype dir is copied to new project', () => {
      expect(fs.existsSync('./my-project')).to.be.true;
      expect(fs.readdirSync('./my-project')).to.be.empty;

      rgu.copyPrototype(null, null);
      expectFilesEqual(
        './my-project/utils/testUtils.js',
        './prototype/utils/testUtils.js'
      );
      expectFilesEqual(
        './my-project/connection/connection.js',
        './prototype/connection/connection.js'
      );
      expectFilesEqual(
        './my-project/connection/testConnection.js',
        './prototype/connection/testConnection.js'
      );
      expectFilesEqual(
        './my-project/transform/transform.js',
        './prototype/transform/transform.js'
      );
      expectFilesEqual(
        './my-project/transform/testTransform.js',
        './prototype/transform/testTransform.js'
      );
    });

    it('transformExample', () => {
      expect(fs.existsSync('./my-project')).to.be.true;
      expect(fs.readdirSync('./my-project')).to.be.empty;

      rgu.copyPrototype('basicBulk', null);
      expectFilesEqual(
        './my-project/utils/testUtils.js',
        './prototype/utils/testUtils.js'
      );
      expectFilesEqual(
        './my-project/connection/connection.js',
        './prototype/connection/connection.js'
      );
      expectFilesEqual(
        './my-project/connection/testConnection.js',
        './prototype/connection/testConnection.js'
      );
      expectFilesEqual(
        './my-project/transform/transform.js',
        './examples/transform/basicBulk/transform.js'
      );
      expectFilesEqual(
        './my-project/transform/testTransform.js',
        './examples/transform/basicBulk/testTransform.js'
      );
    });

    it('connectionExample', () => {
      expect(fs.existsSync('./my-project')).to.be.true;
      expect(fs.readdirSync('./my-project')).to.be.empty;

      rgu.copyPrototype(null, 'basic');
      expectFilesEqual(
        './my-project/utils/testUtils.js',
        './prototype/utils/testUtils.js'
      );
      expectFilesEqual(
        './my-project/connection/connection.js',
        './examples/connection/basic/connection.js'
      );
      expectFilesEqual(
        './my-project/connection/testConnection.js',
        './examples/connection/basic/testConnection.js'
      );
      expectFilesEqual(
        './my-project/transform/transform.js',
        './prototype/transform/transform.js'
      );
      expectFilesEqual(
        './my-project/transform/testTransform.js',
        './prototype/transform/testTransform.js'
      );
    });

    it('both examples', () => {
      expect(fs.existsSync('./my-project')).to.be.true;
      expect(fs.readdirSync('./my-project')).to.be.empty;

      rgu.copyPrototype('basicBulk', 'basic');
      expectFilesEqual(
        './my-project/utils/testUtils.js',
        './prototype/utils/testUtils.js'
      );
      expectFilesEqual(
        './my-project/connection/connection.js',
        './examples/connection/basic/connection.js'
      );
      expectFilesEqual(
        './my-project/connection/testConnection.js',
        './examples/connection/basic/testConnection.js'
      );
      expectFilesEqual(
        './my-project/transform/transform.js',
        './examples/transform/basicBulk/transform.js'
      );
      expectFilesEqual(
        './my-project/transform/testTransform.js',
        './examples/transform/basicBulk/testTransform.js'
      );
    });
  });

  describe('getAllDependencies >', () => {
    const dependencyTree = {
      a: { version: '1.0.0' },
      b: {
        version: '1.0.0',
        dependencies: {
          c: { version: '1.0.0' },
          d: {
            version: '1.0.0',
            dependencies: {
              e: { version: '1.0.0' },
              f: {
                version: '1.0.0',
                dependencies: {
                  g: { version: '1.0.0' },
                },
              },
            },
          },
        },
      },
      h: { version: '1.0.0' },
      i: {
        version: '1.0.0',
        dependencies: {
          j: { version: '1.0.0' },
          c: { version: '1.0.0' },
        },
      },
      l: {
        version: '1.0.0',
        dependencies: {
          m: { version: '1.0.0' },
        },
      },
    };

    it('get all dependencies', () => {
      const modulesToCopy = ['a', 'b', 'i', 'm', 'z'];
      const dependencies = rgu.getAllDependencies(modulesToCopy, dependencyTree);
      expect(dependencies).to.have.keys([
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'i', 'j',
      ]);
    });
  });

  describe('copyPackages >', function () {
    this.timeout(5000);
    before(() => {
      mockFs({
        'my-project': {
          node_modules: {},
        },
        node_modules: {
          '@salesforce': mockDir('./node_modules/@salesforce'),
          chai: mockDir('./node_modules/chai'),
          'chai-url': mockDir('./node_modules/chai-url'),
          'fs-extra': mockDir('./node_modules/fs-extra'),
          istanbul: mockDir('./node_modules/istanbul'),
          mocha: mockDir('./node_modules/mocha'),
          abbrev: mockDir('./node_modules/abbrev'), // dependency
          ajv: mockDir('./node_modules/ajv'), // not dependency
          'align-text': mockDir('./node_modules/align-text'), // dependency
          asn1: mockDir('./node_modules/asn1'), // not dependency
        },
      });
    });

    after(() => {
      mockFs.restore();
    });

    it('packages are copied', () => {
      expect(fs.readdirSync('./my-project/node_modules')).to.be.empty;
      rgu.copyPackages();
      expect(fs.readdirSync('./my-project/node_modules')).to.have.members([
        '@salesforce', 'abbrev', 'ajv', 'align-text', 'chai', 'chai-url',
        'fs-extra', 'istanbul', 'mocha',
      ]);
    });
  });

  describe('setupPackageJson >', () => {
    before(() => fs.mkdir(`./${projectName}`));
    after(() => fs.remove(`./${projectName}`));

    it('package.json is created', () => {
      expect(fs.existsSync(`./${projectName}/package.json`)).to.be.false;

      rgu.setupPackageJson(`./${projectName}`);
      expect(fs.existsSync(`./${projectName}/package.json`)).to.be.true;

      const contents = fs.readJsonSync(`./${projectName}/package.json`);
      expect(contents).to.have.keys(
        'name', 'version', 'description', 'main', 'dependencies',
        'scripts', 'keywords', 'author', 'license'
      );
      expect(contents.dependencies).to.have.keys(
        '@salesforce/refocus-collector-eval', 'ajv', 'chai', 'chai-url',
        'fs-extra', 'istanbul', 'mocha'
      );
      expect(contents.scripts).to.have.keys(
        'test', 'build', 'deploy', 'template-init', 'test-connection',
        'test-transform', 'validate'
      );
    });
  });

  describe('addScriptsAndDependencies >', () => {
    const packageJson = {
      name: 'my-sgt',
      version: '1.0.0',
      description: '...',
      main: 'index.js',
      keywords: [],
      author: '...',
      license: 'BSD-3-clause',
    };

    it('undefined scripts and dependencies', () => {
      rgu.addScriptsAndDependencies(packageJson);
      expect(packageJson).to.have.keys(
        'name', 'version', 'description', 'main', 'dependencies',
        'scripts', 'keywords', 'author', 'license'
      );
      expect(packageJson.dependencies).to.have.keys(
        '@salesforce/refocus-collector-eval', 'ajv', 'chai', 'chai-url',
        'fs-extra', 'istanbul', 'mocha'
      );
      expect(packageJson.scripts).to.have.keys(
        'test', 'build', 'deploy', 'template-init', 'test-connection',
        'test-transform', 'validate'
      );
    });

    it('empty scripts and dependencies', () => {
      packageJson.dependencies = {};
      packageJson.scripts = {};
      rgu.addScriptsAndDependencies(packageJson);
      expect(packageJson).to.have.keys(
        'name', 'version', 'description', 'main', 'dependencies',
        'scripts', 'keywords', 'author', 'license'
      );
      expect(packageJson.dependencies).to.have.keys(
        '@salesforce/refocus-collector-eval', 'ajv', 'chai', 'chai-url',
        'fs-extra', 'istanbul', 'mocha'
      );
      expect(packageJson.scripts).to.have.keys(
        'test', 'build', 'deploy', 'template-init', 'test-connection',
        'test-transform', 'validate'
      );
    });

    it('preexisting scripts and dependencies', () => {
      packageJson.dependencies = {
        dep1: '1.0.0',
        dep2: '1.0.0',
      };
      packageJson.scripts = {
        script1: '...',
        script2: '...',
      };
      rgu.addScriptsAndDependencies(packageJson);
      expect(packageJson).to.have.keys(
        'name', 'version', 'description', 'main', 'dependencies',
        'scripts', 'keywords', 'author', 'license'
      );
      expect(packageJson.dependencies).to.have.keys(
        '@salesforce/refocus-collector-eval', 'ajv', 'chai', 'chai-url',
        'dep1', 'dep2', 'fs-extra', 'istanbul', 'mocha'
      );
      expect(packageJson.scripts).to.have.keys(
        'test', 'build', 'deploy', 'script1', 'script2', 'template-init',
        'test-connection', 'test-transform', 'validate'
      );
    });
  });

  describe('getPackageInfo >', () => {
    before(() => {
      const package = {
        name: 'refocus-sample-generator-template-utils',
        version: '1.0.0',
        description: 'Refocus Sample Generator Template Utilities',
        main: 'index.js',
      };

      mockFs({
        'my-project': {
          'package.json': JSON.stringify({
            name: 'refocus-sample-generator-template-utils',
            version: '1.0.0',
            description: 'Refocus Sample Generator Template Utilities',
            main: 'index.js',
          }),
        },
      });
    });

    after(() => {
      mockFs.restore();
    });

    it('getPackageInfo', function () {
      const contents = rgu.getPackageInfo();
      expect(contents).to.have.keys('name', 'version', 'description', 'main');
    });
  });

  describe('createTemplateJson >', () => {
    beforeEach(() => mockFs({
      'my-project': {},
    }));
    afterEach(() => mockFs.restore());

    const packageInfo = {
      name: 'my-project',
      version: '1.0.0',
      description: 'description...',
      keywords: ['tag1', 'tag2'],
      author: 'author1',
      repository: 'http://github.com/my-project',
    };

    const expectedSGT = {
      name: 'my-project',
      version: '1.0.0',
      description: 'description...',
      tags: ['tag1', 'tag2', 'my-project'],
      author: 'author1',
      repository: 'http://github.com/my-project',
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

    it('sgt file is created', () => {
      expect(fs.existsSync('./my-project')).to.be.true;
      expect(fs.existsSync('./my-project/my-project.json')).to.be.false;

      rgu.createTemplateJson(packageInfo);
      expect(fs.existsSync('./my-project/my-project.json')).to.be.true;

      const contents = fs.readJsonSync('./my-project/my-project.json');
      expect(contents).to.deep.equal(expectedSGT);
    });

    it('sgt file is created (no keywords)', () => {
      delete packageInfo.keywords;
      expectedSGT.tags = ['my-project'];
      expect(fs.existsSync('./my-project')).to.be.true;
      expect(fs.existsSync('./my-project/my-project.json')).to.be.false;

      rgu.createTemplateJson(packageInfo);
      expect(fs.existsSync('./my-project/my-project.json')).to.be.true;

      const contents = fs.readJsonSync('./my-project/my-project.json');
      expect(contents).to.deep.equal(expectedSGT);
    });

    it('sgt file is created (keywords not array)', () => {
      packageInfo.keywords = '';
      expectedSGT.tags = ['my-project'];
      expect(fs.existsSync('./my-project')).to.be.true;
      expect(fs.existsSync('./my-project/my-project.json')).to.be.false;

      rgu.createTemplateJson(packageInfo);
      expect(fs.existsSync('./my-project/my-project.json')).to.be.true;

      const contents = fs.readJsonSync('./my-project/my-project.json');
      expect(contents).to.deep.equal(expectedSGT);
    });
  });

  describe('createReadme >', () => {
    beforeEach(() => mockFs({
      'my-project': {},
    }));
    afterEach(() => mockFs.restore());

    const packageInfo = {
      name: 'my-project',
      description: 'description...',
    };

    it('README file is created', () => {
      expect(fs.existsSync('./my-project')).to.be.true;
      expect(fs.existsSync('./my-project/README.md')).to.be.false;

      rgu.createReadme(packageInfo);
      expect(fs.existsSync('./my-project/README.md')).to.be.true;

      const contents = fs.readFileSync('./my-project/README.md').toString();
      expect(contents).to.include('# my-project');
      expect(contents).to.include('## Description\n\ndescription...');
      expect(contents).to.include('## Context Variables\n\n The following ');
    });

    it('README file is created (default description)', () => {
      delete packageInfo.description;
      expect(fs.existsSync('./my-project')).to.be.true;
      expect(fs.existsSync('./my-project/README.md')).to.be.false;

      rgu.createReadme(packageInfo);
      expect(fs.existsSync('./my-project/README.md')).to.be.true;

      const contents = fs.readFileSync('./my-project/README.md').toString();
      expect(contents).to.include('# my-project');
      expect(contents).to.include(
        '## Description\n\nA Refocus Sample Generator Template.'
      );
      expect(contents).to.include('## Context Variables\n\n The following ');
    });
  });

});
