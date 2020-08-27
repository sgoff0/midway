/**
 * MIT License
 *
 * Copyright (c) 2018-present, Walmart Inc.,
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
var Decache = require('decache');
var Expect = require('chai').expect;
var Fs = require('fs');
var Path = require('path');
var Proxyquire = require('proxyquire');
var Sinon = require('sinon');
var Smocks = require('testarmada-midway-smocks');

var midway;

describe('index-tests-multi-repo', function () {
  var Sandbox;
  var CloneStub;
  var PullStub;
  var FsStub;

  beforeEach(function (done) {
    Sandbox = Sinon.sandbox.create();
    CloneStub = Sandbox.stub();
    PullStub = Sandbox.stub();
    FsStub = Sandbox.stub();

    Decache('simple-git');
    Decache('../../index');
    Decache('../../resources/endpoints.js');

    Proxyquire('../../lib/multiGitRepo/clone', {
      'simple-git': function () {
        return {
          clone: CloneStub,
          pull: PullStub,
        };
      },
    });
    done();
  });

  afterEach(function (done) {
    Sinon.restore(FsStub);
    Sandbox.restore();
    done();
  });

  it('Verify if ID is passed, Midway server returns that ID', function (done) {
    midway = require('../../index');
    var smocksId = Smocks._id;
    Smocks._id = undefined;
    var midwayServerObject = midway.id('indextest');
    Expect(midwayServerObject._id).to.equal('indextest');
    Smocks._id = smocksId;
    done();
  });

  it('Verify start throws error if clone failed with multi repos', function () {
    CloneStub.yields('error in clone');

    FsStub = Sinon.stub(Fs, 'existsSync');
    FsStub.returns(false);
    midway = require('../../index');

    midway.start(
      {
        host: 'localhost',
        sessions: 5,
        collectMetrics: true,
        multipleGitRepos: [
          {
            git: 'git@github.com:TestArmada/midway.git',
            mocks: 'endpoint.js',
            data: 'mockedData',
          },
        ],
      },
      function (err) {
        Expect(err).to.not.be.undefined;
        Expect(err.message).to.not.be.undefined;
        Expect(err.message).to.equal('error in clone'); //CHECK - THIS DOESNT WORK EVEN IF CHANGED
      },
    );
  });

  it('Verify start throws error if clone failed with multi repos no callback', function () {
    CloneStub.yields('error in clone');

    FsStub = Sinon.stub(Fs, 'existsSync');
    FsStub.returns(false);
    var ServerControllerSpy = Sandbox.spy(
      require('../../lib/server-controller'),
      'start',
    );

    midway = require('../../index');
    midway.start({
      host: 'localhost',
      sessions: 5,
      collectMetrics: true,
      multipleGitRepos: [
        {
          git: 'git@github.com:TestArmada/midway.git',
          mocks: 'endpoint.js',
          data: 'mockedData',
        },
      ],
    });
    Expect(ServerControllerSpy.callCount).to.equal(0);
    ServerControllerSpy.restore();
  });

  it('Should set mocked directory in smock route object', function () {
    midway = require('../../index');
    var RepoUtil = require('../../lib/multiGitRepo/repo-util');
    RepoUtil.setMultiRepoDirectory('/mocked-data');
    var smockRouteObject = midway.route({
      id: 'repo',
      label: 'Repo',
      path: '/repo',
      handler: function (req, h) {
        midway.util.respondWithFile(this, reply);
      },
    });
    Expect(smockRouteObject.mockedDirectory).to.equal('./repos/mocked-data');
    RepoUtil.setMultiRepoDirectory(undefined);
  });

  it('Verify respondWithFile with mocked directory for multi repo', function (done) {
    var FilePathController = require('../../lib/file-handler/file-path-controller');
    var FilePathControllerSpy = Sandbox.spy(FilePathController, 'getFilePath');

    var commonUtils = require('../../lib/utils/common-utils');
    commonUtils.initializeSessionURLCallCount();

    var mockedDirPath = Path.join(process.cwd(), '/repos/repo1/mockedData');
    var thisRoute = {
      route: {
        mockedDirectory: mockedDirPath,
      },
      variant: {
        id: function () {
          return 'default';
        },

        _route: {
          handler: function () {
            return 'Variant handler called';
          },
          path: function () {
            return 'repo1';
          },
          method: function () {
            return 'GET';
          },
        },
      },
    };

    var reply = function () {
      this.type = function () {
        return this;
      };
      this.hold = function () {
        return this;
      };
      this.send = function () {
        return this;
      };
      return this.type().hold().send();
    };

    commonUtils.respondWithFile(thisRoute, reply);

    Expect(FilePathControllerSpy.callCount).to.equal(1);
    Expect(FilePathControllerSpy.getCall(0).args[1]).to.equal(mockedDirPath);
    done();
  });
});
