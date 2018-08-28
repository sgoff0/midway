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
var Assert = require('chai').assert;
var Expect = require('chai').expect;

var Decache = require('decache');
var MockRequire = require('mock-require');
var Proxyquire = require('proxyquire');
var Sinon = require('sinon');

var Path = require('path');
var Fs = require('fs');

var RepoUtil;

describe('repo-util-tests', function () {
  var Sandbox;
  var CloneStub;
  var PullStub;
  var FsStub;

  beforeEach(function (done) {
    Sandbox = Sinon.sandbox.create();
    CloneStub = Sandbox.stub();
    PullStub = Sandbox.stub();

    Decache('../../lib/multiGitRepo/clone');
    Decache('../../lib/multiGitRepo/repo-util');

    Proxyquire('../../lib/multiGitRepo/clone', {
      'simple-git': function () {
        return {
          clone: CloneStub,
          pull: PullStub
        };
      }
    });

    RepoUtil = require('../../lib/multiGitRepo/repo-util');
    done();
  });

  afterEach(function (done) {

    if (FsStub) {
      FsStub.restore();
    }
    Sinon.restore(CloneStub);
    Sinon.restore(FsStub);
    Sinon.restore(PullStub);
    Sandbox.restore();
    done();
  });

  it('Verify if multiRepoDirectory is set correctly', function (done) {
    Expect(RepoUtil.getMultiRepoDirectory()).to.equal(undefined);
    RepoUtil.setMultiRepoDirectory('/mocked-data');
    Expect(RepoUtil.getMultiRepoDirectory()).to.equal('/mocked-data');
    done();
  });

  it('Verify if require endpoints work', function (done) {
    var repos = [
      {
        'mocks': '/repo1/endpoint.js',
        'data': '/repo1/mockedData'
      }
    ];
    var endPointPath = Path.join(process.cwd(), 'repos', repos[0].mocks);
    MockRequire(endPointPath);
    RepoUtil.requireEndpoints(repos);
    Expect(RepoUtil.getMultiRepoDirectory()).to.equal(undefined);
    MockRequire.stop(endPointPath);
    done();
  });

  it('Verify no endpoints required when repos is not passed', function (done) {
    var repos;
    var RepoUtilSetMultiRepoSpy = Sandbox.spy(RepoUtil, 'setMultiRepoDirectory');
    RepoUtil.requireEndpoints(repos);
    Expect(RepoUtilSetMultiRepoSpy.callCount).to.equal(1);
    Expect(RepoUtilSetMultiRepoSpy.calledWith(undefined)).to.be.true;
    Expect(RepoUtil.getMultiRepoDirectory()).to.equal(undefined);
    done();
  });

  it('Throws error required endpoint does not exist', function (done) {
    var repos = [
      {
        'mocks': '/repo1/endpoint_does_not_exist.js',
        'data': '/repo1/mockedData'
      }
    ];
    try {
      RepoUtil.requireEndpoints(repos);
      Expect(RepoUtil.getMultiRepoDirectory()).to.equal(undefined);
      Assert.fail('Should throw an exception if required endpoint does not exist');
    } catch (e) {
      Expect(e.message.indexOf('Cannot find module') > -1).to.be.true;
    }

    done();
  });

  it('Verify valid multiGitRepo object', function (done) {
    var repos = [
      {
        'git': 'https://repo1.git.com',
        'mocks': '/repo1/endpoint.js',
        'data': '/repo1/mockedData'
      },
      {
        'git': 'https://repo2.git.com',
        'mocks': '/repo2/endpoint.js',
        'data': '/repo2/mockedData'
      }
    ];
    try {
      RepoUtil.validateRepoInfo(repos);
    } catch (e) {
      Assert.fail('Should not throw exception if valid multiGitRepo object');
    }
    done();
  });

  it('Verify invalid multiGitRepo object', function (done) {
    var repos = [
      {
        'mocks': '/repo1/endpoint.js',
        'data': '/repo1/mockedData'
      },
      {
        'git': 'https://repo2.git.com',
        'mocks': '/repo2/endpoint.js',
        'data': '/repo2/mockedData'
      }
    ];
    try {
      RepoUtil.validateRepoInfo(repos);
      Assert.fail('Should have thrown an error when multiGitRepo object is invalid');
    } catch (e) {
      var message = 'Missing field git in ' + JSON.stringify({
        'mocks': '/repo1/endpoint.js',
        'data': '/repo1/mockedData'
      }, null, 3
        );
      Expect(message).to.equal(e.message);
      done();
    }
  });

  it('Verify multiple repo options', function (done) {
    FsStub = Sinon.stub(Fs, 'existsSync').returns(false);
    CloneStub.yields(null);
    MockRequire(Path.join(process.cwd(), 'repos/repo1/endpoint.js'));

    var midwayOptions = {
      port: 8000,
      httpsPort: 4444,
      mockedDirectory: './resources/mocked-data',
      sessions: 1,
      multipleGitRepos: [
        {
          'git': 'git@github.com:org1/repo1.git',
          'mocks': '/endpoint.js',
          'data': '/mockedData'
        }
      ]
    };

    RepoUtil.handleMultipleRepos(midwayOptions).then(function (data) {
      Expect(data).to.be.undefined;
      MockRequire.stop(Path.join(process.cwd(), 'repos/repo1/endpoint.js'));
      done();
    });
  });

  it('Verify multiple repo options with error', function (done) {
    FsStub = Sinon.stub(Fs, 'existsSync').returns(false);
    CloneStub.yields('Error in clone');

    var midwayOptions = {
      port: 8000,
      httpsPort: 4444,
      mockedDirectory: './resources/mocked-data',
      sessions: 1,
      multipleGitRepos: [
        {
          'git': 'git@github.com:org1/repo1.git',
          'mocks': '/endpoint.js',
          'data': '/mockedData'
        }
      ]
    };

    RepoUtil.handleMultipleRepos(midwayOptions).then(function () {
      Assert.fail('Should have thrown an exception');
      done();
    }).catch(function (err) {
      Expect(err).to.not.be.undefined;
      done();
    });
  });
});
