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
var MidwayServer = require('../../resources/run-mock-server-api-dynamic.js');
var Expect = require('chai').expect;
var midway = require('../../lib/index');
var State = require('../../lib/session-manager/session-manager').SESSION_STATE;
var MidwayRoutesInfo = require('../../lib/server-routes/midway-routes-info');
var Utils = require('../../lib/utils/common-utils');
var servers = MidwayServer.getServers();
var Async = require('async');
var Constants = require('../../lib/constants');
var sinon = require('sinon');

//server = servers[0];
servers.forEach(function (server) {
  describe('session-apis-test - ' + server.app, function () {

    it('Check that available sessions can be retrieved from midway', function (done) {
      var sessions = midway.getSessions();
      Expect(sessions).to.not.equal(null);
      sessionId = Object.keys(sessions)[0];
      Expect(sessionId).to.not.equal(null);
      done();
    });

    it('Check that initial state of session is AVAILABLE', function (done) {
      var sessions = midway.getSessions();
      sessionId = Object.keys(sessions)[0];
      var sessionStatus = midway.checkSession(sessionId);
      Expect(sessionStatus).to.equal(State.available);
      done();
    });

    it('Check a session can be registered with midway', function (done) {
      var sessionId = midway.registerSession();
      Expect(sessionId).to.not.equal(null);
      closeSession(sessionId, done);
    });

    it('Check that getSession api has updated status after registering session', function (done) {
      var sessionId = midway.registerSession();
      var sessionStatus = midway.checkSession(sessionId);
      Expect(sessionStatus).to.equal(State.inuse);
      closeSession(sessionId, done);
    });

    it('Check a session cannot be registered again once registered', function (done) {
      var sessionID = [];
      for (var i = 0; i < 5; i++) {
        sessionID.push(midway.registerSession());
      }

      // Try to register again
      var sessionIdRegister = midway.registerSession();
      Expect(sessionIdRegister).to.equal(State.busy);
      Async.forEach(sessionID, midway.closeSession, function () {
        done();
      });
    });

    it('Check a session can be de-registered with midway', function (done) {
      var sessionId = midway.registerSession();
      midway.closeSession(sessionId, function (state) {
        Expect(state).to.equal(State.available);
        var sessionStatus = midway.checkSession(sessionId);
        Expect(sessionStatus).to.equal(State.available);
        done();
      });
    });

    it('Check a session can be de-registered with midway with _activeVariant as default', function (done) {
      var mockedRouteObject = {
        _label: 'xyz',
        _path: 'xyz/abc',
        _method: 'GET',
        _activeVariant: 'default'
      };

      var mockedSessionRoutes = [];
      mockedSessionRoutes.push(mockedRouteObject);
      var stub = sinon.stub(MidwayRoutesInfo, 'getUserRoutesForSession');

      stub.returns(mockedSessionRoutes);
      var sessionId = midway.registerSession();
      Expect(sessionId).to.not.equal(null);
      midway.closeSession(sessionId, function () {
        var sessionStatus = midway.checkSession(sessionId);
        Expect(sessionStatus).to.equal(State.available);
        stub.restore();
        done();
      });

    });

    it('Verify an invalid session id is reported as DOES_NOT_EXISTS when checking session state', function (done) {
      var sessionStatus = midway.checkSession('0000');
      Expect(sessionStatus).to.equal(State.invalid);
      done();
    });

    it('Verify an invalid session id is reported as DOES_NOT_EXISTS when closing session state', function (done) {
      midway.closeSession('0000', function (sessionStatus) {
        Expect(sessionStatus).to.equal(State.invalid);
        done();
      });
    });

    it('Verify variant is set to default on closing a session', function (done) {
      var sessionId = midway.registerSession();
      var setVariantOptions = {};
      var url = '/closeSessionTest?midwaySessionId=' + sessionId;
      setVariantOptions[Constants.VARIANT] = 'variant';
      setVariantOptions[Constants.FIXTURE] = 'closeSessions-' + sessionId;
      midway.setMockVariant(setVariantOptions, function () {
        server
          .get(url)
          .expect(200)
          .end(function (err, res) {
            Expect(res.text).to.equal('not_default');

            midway.closeSession(sessionId, function () {
              server
                .get(url)
                .expect(200)
                .end(function (err, res) {
                  Expect(res.text).to.equal('default');
                  done();
                });
            });
          });
      });
    });
    it('Verify variant is set to default on closing a session when setMockVariant throws an error', function (done) {
      var sessionId = midway.registerSession();
      var setVariantOptions = {};
      var url = '/closeSessionTest?midwaySessionId=' + sessionId;
      setVariantOptions[Constants.VARIANT] = 'variant';
      setVariantOptions[Constants.FIXTURE] = 'closeSessions-' + sessionId;
      midway.setMockVariant(setVariantOptions, function () {
        server
          .get(url)
          .expect(200)
          .end(function (err, res) {
            Expect(res.text).to.equal('not_default');
            var stub = sinon.stub(Utils, 'setMockVariant');
            stub.yields(new Error('mockederror'));
            midway.closeSession(sessionId, function (err) {
              var sessionStatus = midway.checkSession(sessionId);
              Expect(err.message).to.equal('mockederror');
              Expect(sessionStatus).to.equal(State.inuse);
              stub.restore();
              closeSession(sessionId, done);
            });
          });
      });
    });
  });
});

function closeSession(sessionId, callback) {
  midway.closeSession(sessionId, function () {
    callback();
  });
}

