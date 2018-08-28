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
var Expect = require('chai').expect;
var Sinon = require('sinon');

var MidwayServer = require('../../resources/run-mock-server-api-dynamic.js');
var State = require('../../lib/session-manager/session-manager').SESSION_STATE;
var sessionId;
var Constants = require('../../lib/constants');
var CommonUtils = require('../../lib/utils/common-utils');
var SessionManager = require('../../lib/session-manager/session-manager');

var servers = MidwayServer.getServers();

servers.forEach(function (server) {
  describe('session-rest-test - ' + server.app, function () {

    it('Check that available sessions can be retrieved from midway', function (done) {
      server
        .get(Constants.MIDWAY_API_PATH + '/getSessions')
        .expect('Content-type', /json/)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.body.sessions).to.not.equal(null);
          sessionId = Object.keys(res.body.sessions)[0];
          done();
        });
    });

    it('Check that initial state of session is available', function (done) {
      server
        .get(Constants.MIDWAY_API_PATH + '/checkSession/' + sessionId)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.body['session-status']).to.equal(State.available);
          done();
        });
    });

    it('Check a session can be registered with midway', function (done) {
      server
      .get(Constants.MIDWAY_API_PATH + '/registerSession')
      .expect('Content-type', /json/)
      .end(function (err, res) {
        Expect(err).to.equal(null);
        Expect(res.status).to.equal(200);
        Expect(res.body.session).to.equal(sessionId);
        done();
      });
    });

    it('Check that getSession api has updated status after registering session', function (done) {
      server
        .get(Constants.MIDWAY_API_PATH + '/getSessions')
        .expect('Content-type', /json/)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.body.sessions).to.not.equal(null);
          Expect(res.body.sessions[sessionId]).to.equal(State.inuse);
          done();
        });
    });

    it('Check a session state is changed to IN_USE after registering', function (done) {
      server
        .get(Constants.MIDWAY_API_PATH + '/checkSession/' + sessionId)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.body['session-status']).to.equal(State.inuse);
          done();
        });
    });

    it('Check a session can be de-registered with midway', function (done) {
      server
        .get(Constants.MIDWAY_API_PATH + '/closeSession/' + sessionId)
        .expect('Content-type', /json/)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.body.session).to.equal(State.available);
          done();
        });
    });

    it('Verify an invalid session id is reported as DOES_NOT_EXISTS when checking session state', function (done) {
      server
        .get(Constants.MIDWAY_API_PATH + '/checkSession/0000')
        .expect('Content-type', /json/)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.body['session-status']).to.equal(State.invalid);
          done();
        });
    });

    it('Verify an invalid session id is reported as DOES_NOT_EXISTS when closing session state', function (done) {
      server
        .get(Constants.MIDWAY_API_PATH + '/closeSession/0000')
        .expect('Content-type', /json/)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.body.session).to.equal(State.invalid);
          done();
        });
    });

    it('Verify if port from query is  is called when not set already', function (done) {

      var sessionManagerStub = Sinon.stub(SessionManager, 'closeSession', function (sessionId, cb) {
        return cb(null, {
          status: 200,
          body: {
            session: State.invalid
          }
        });
      });

      var originalPort = CommonUtils.getPortInfo()[Constants.HTTP_PORT];

      CommonUtils.setHttpPort(Constants.NOT_AVAILABLE);
      server
        .get(Constants.MIDWAY_API_PATH + '/closeSession/0000?mocksPort=1000')
        .expect('Content-type', /json/)
        .end(function (err, res) {
          Expect(res.status).to.equal(200);
          Expect(CommonUtils.getPortInfo()[Constants.HTTP_PORT]).to.equal(1000);

          CommonUtils.setHttpPort(originalPort);
          sessionManagerStub.restore();
          done();
        });
    });
  });
});
