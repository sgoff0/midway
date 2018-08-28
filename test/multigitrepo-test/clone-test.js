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

/**
var Expect = require('chai').expect;
var Assert = require('chai').assert;
var Sinon = require('sinon');
var Proxyquire = require('proxyquire');
var Fs = require('fs');
var Decache = require('decache');

describe('clone-tests', function () {
  var Sandbox;
  var CloneStub;
  var PullStub;
  var FsStub;

  beforeEach(function (done) {
    Sandbox = Sinon.sandbox.create();
    CloneStub = Sandbox.stub();
    PullStub = Sandbox.stub();

    Decache('../../lib/multiGitRepo/clone');

    Proxyquire('../../lib/multiGitRepo/clone', {
      'simple-git': function () {
        return {
          clone: CloneStub,
          pull: PullStub
        };
      }
    });
    done();
  });

  afterEach(function (done) {
    FsStub.restore();
    Sinon.restore(CloneStub);
    Sinon.restore(PullStub);
    Sandbox.restore();
    Decache('fs');
    done();
  });

  it('Verify if cloned successfully', function (done) {
    FsStub = Sinon.stub(Fs, 'existsSync').returns(false);
    CloneStub.yields(null);

    var repos = [
      {
        'git': 'https://walmart.github.com/walmart/test-repo',
        'mocks': '/mocks/endpoints.js',
        'data': '/mocks/mocked-data'
      }
    ];

    var Clone = require('../../lib/multiGitRepo/clone');

    Clone(repos).then(function (repos) {
      Expect(repos).to.not.be.undefined;
      Expect(repos instanceof Array).to.be.true;
      Expect(repos.length > 0).to.be.true;
      Expect(repos[0].mocks).to.equal('/test-repo/mocks/endpoints.js');
      Expect(repos[0].data).to.equal('/test-repo/mocks/mocked-data');
      done();
    }).catch(function (err) {
      console.log(err);
      Assert.fail('Should not throw error when cloning - ' + err);
      done();
    });
  });

  it('Handle error if clone failed', function (done) {
    FsStub = Sinon.stub(Fs, 'existsSync').returns(false);
    CloneStub.yields('Error in cloning');

    var repos = [
      {
        'git': '......',
        'mocks': '/mocks/endpoints.js',
        'data': '/mocks/mocked-data'
      }
    ];

    var Clone = require('../../lib/multiGitRepo/clone');

    Clone(repos).then(function () {
      Assert.fail('Should catch error');
      done();
    }).catch(function (err) {
      Expect(err).to.not.be.undefined;
      Expect(err.message).to.equal('Error in cloning');
      done();
    });
  });

  it('Verify if pulled successfully', function (done) {
    FsStub = Sinon.stub(Fs, 'existsSync').returns(true);
    PullStub.yields(null);

    var repos = [
      {
        'git': 'https://walmart.github.com/walmart/test-repo',
        'mocks': '/mocks/endpoints.js',
        'data': '/mocks/mocked-data'
      }
    ];

    var Clone = require('../../lib/multiGitRepo/clone');

    Clone(repos).then(function (repos) {
      Expect(repos).to.not.be.undefined;
      Expect(repos instanceof Array).to.be.true;
      Expect(repos.length > 0).to.be.true;
      Expect(repos[0].mocks).to.equal('/test-repo/mocks/endpoints.js');
      Expect(repos[0].data).to.equal('/test-repo/mocks/mocked-data');
      done();
    }).catch(function (err) {
      Assert.fail('Should not throw error when cloning - ' + err);
      done();
    });
  });

  it('Handle error if pull failed', function (done) {
    FsStub = Sinon.stub(Fs, 'existsSync').returns(true);
    PullStub.yields('Error in pulling');

    var repos = [
      {
        'git': '...',
        'mocks': '/mocks/endpoints.js',
        'data': '/mocks/mocked-data'
      }
    ];

    var Clone = require('../../lib/multiGitRepo/clone');

    Clone(repos).then(function () {
      Assert.fail('Should catch error');
      done();
    }).catch(function (err) {
      Expect(err).to.not.be.undefined;
      Expect(err.message).to.equal('Error in doing git pull for git@github.com:walmart/test-repo.git');
      done();
    });
  });
});

 */