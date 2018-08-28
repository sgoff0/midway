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
var KillProcess;
var Proxyquire = require('proxyquire');
var Expect = require('chai').expect;
var Sinon = require('sinon');
var Decache = require('decache');
var Logger;
var TreeKillStub;
var Sandbox;
var LoggerSpy;

describe('kill-process', function () {

  beforeEach(function (done) {
    Decache('../../lib/utils/kill-process');
    Decache('testarmada-midway-logger');
    Logger = require('testarmada-midway-logger');
    Sandbox = Sinon.sandbox.create();
    TreeKillStub = Sandbox.stub();
    LoggerSpy = Sandbox.spy(Logger, 'error');
    Proxyquire('../../lib/utils/kill-process', {
      'tree-kill': TreeKillStub
    });
    KillProcess = require('../../lib/utils/kill-process');
    done();
  });

  afterEach(function (done) {
    Sandbox.restore();
    done();
  });

  it('should kill all processes', function (done) {
    TreeKillStub.yields(null);

    var signal = 'KILL';
    KillProcess('101', signal, function (err) {
      Expect(err).to.be.undefined;
      Expect(TreeKillStub.getCall(0).args[0]).to.equal('101');
      Expect(TreeKillStub.getCall(0).args[1]).to.equal('KILL');
      done();
    });
  });

  it('should kill all processes w/ undefined signal', function (done) {
    TreeKillStub.yields(null);

    var signal;
    KillProcess('101', signal, function (err) {
      Expect(err).to.be.undefined;
      Expect(TreeKillStub.getCall(0).args[0]).to.equal('101');
      done();
    });
  });

  it('should kill all processes no callback', function (done) {
    TreeKillStub.yields(null);

    KillProcess('101', 'KILL');
    process.nextTick(function () {
      Expect(TreeKillStub.getCall(0).args[0]).to.equal('101');
      Expect(TreeKillStub.getCall(0).args[1]).to.equal('KILL');
      done();
    });

  });


  it('should not return error if not able to kill process', function (done) {
    TreeKillStub.yields(new Error('error in killing process'));
    var signal = 'KILLERROR';

    KillProcess('102', signal, function (err) {
      Expect(err).to.be.undefined;
      Expect(LoggerSpy.calledOnce).to.equal(true);
      Expect(TreeKillStub.getCall(0).args[0]).to.equal('102');
      Expect(TreeKillStub.getCall(0).args[1]).to.equal('KILLERROR');
      Expect(LoggerSpy).to.be.not.undefined;
      Expect(LoggerSpy).to.be.not.null;
      Expect(LoggerSpy.firstCall.args[0].toString()).to.equal('Error: error in killing process');
      done();
    });
  });

  it('should not return error if not able to kill process no callback passed', function (done) {
    TreeKillStub.throws({name: 'Kill error', message: 'Failed to kill process: Error: kill ESRCH'});
    var signal = 'KILLERROR';
    KillProcess('102', signal);
    Expect(LoggerSpy.calledOnce).to.equal(true);
    Expect(TreeKillStub.getCall(0).args[0]).to.equal('102');
    Expect(TreeKillStub.getCall(0).args[1]).to.equal('KILLERROR');
    Expect(LoggerSpy).to.be.not.undefined;
    Expect(LoggerSpy).to.be.not.null;
    Expect(LoggerSpy.firstCall.args[0]).to.equal('Error in killing process with pid :102 , error:Failed to kill process: Error: kill ESRCH');
    done();
  });

  it('should exit gracefully error if kill throws exception', function (done) {
    TreeKillStub.throws({name: 'Kill error', message: 'Failed to kill process: Error: kill ESRCH'});
    var signal = 'KILLERROR';
    KillProcess('102', signal, function (err) {
      Expect(err).to.be.undefined;
      Expect(TreeKillStub.getCall(0).args[0]).to.equal('102');
      Expect(TreeKillStub.getCall(0).args[1]).to.equal('KILLERROR');
      Expect(LoggerSpy.calledOnce).to.equal(true);
      console.log(LoggerSpy.firstCall.args[0]);
      Expect(LoggerSpy.firstCall.args[0]).to.equal('Error in killing process with pid :102 , error:Failed to kill process: Error: kill ESRCH');
      done();
    });
  });
});
