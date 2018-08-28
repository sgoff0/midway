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
var Constants = require('../../lib/constants');
var State = require('../../lib/session-manager/session-manager').SESSION_STATE;
var servers = MidwayServer.getServers();

servers.forEach(function (server) {
  describe('state-manager-rest-tests - ' + server.app, function () {

    it('Check that state can be set and retrieved', function (done) {
      addState(server, undefined, '12345', function () {
        getState(server, undefined, '12345', function () {
          clearState(server, undefined, done);
        });
      });
    });

    it('Check that state can be set and retrieved for parallel sessions', function (done) {
      registerSession(server, function (sessionId) {
        addState(server, sessionId, '12345', function () {
          getState(server, sessionId, '12345', function () {
            closeSession(server, sessionId, done);
          });
        });
      });
    });

    it('Check that state value is undefined if not set', function (done) {
      getState(server, undefined, '', done);
    });

    it('Check that state value is undefined if not set for parallel sessions', function (done) {
      registerSession(server, function (sessionId) {
        getState(server, sessionId, '', function () {
          closeSession(server, sessionId, done);
        });
      });
    });

    it('Check that state can be cleared', function (done) {
      addState(server, undefined, '1234', function () {
        getState(server, undefined, '1234', function () {
          clearState(server, undefined, done);
        });
      });
    });

    it('Check that state can be cleared for parallel sessions', function (done) {
      registerSession(server, function (sessionId) {
        addState(server, sessionId, '1234', function () {
          getState(server, sessionId, '1234', function () {
            clearState(server, sessionId, function () {
              closeSession(server, sessionId, done);
            });
          });
        });
      });
    });

    it('Check that state is cleared itself on closing a session', function (done) {
      registerSession(server, function (sessionId) {
        addState(server, sessionId, '12345', function () {
          getState(server, sessionId, '12345', function () {
            closeSession(server, sessionId, function () {
              getState(server, sessionId, '', done);
            });
          });
        });
      });
    });

  });
});

function closeSession(server, sessionId, callback) {
  server
    .get(Constants.MIDWAY_API_PATH + '/closeSession/' + sessionId)
    .end(function (err, res) {
      Expect(err).to.equal(null);
      Expect(res.status).to.equal(200);
      Expect(res.body.session).to.equal(State.available);
      callback();
    });
}

function getState(server, sessionId, textToVerify, callback) {
  var api = getAPIWithSessionId('/getState', sessionId);
  server
    .get(api)
    .end(function (err, res) {
      Expect(err).to.equal(null);
      Expect(res.status).to.equal(200);
      Expect(res.text).to.equal(textToVerify);
      callback();
    });
}

function addState(server, sessionId, textToVerify, callback) {
  var api = getAPIWithSessionId('/addState', sessionId);
  if (sessionId) {
    api += '&stateValue=' + textToVerify;
  } else {
    api += '?stateValue=' + textToVerify;
  }
  server
    .get(api)
    .end(function (err, res) {
      Expect(err).to.equal(null);
      Expect(res.status).to.equal(200);
      Expect(res.text).to.equal(textToVerify);
      callback();
    });
}

function registerSession(server, callback) {
  server
    .get(Constants.MIDWAY_API_PATH + '/registerSession')
    .expect('Content-type', /json/)
    .end(function (err, res) {
      Expect(err).to.equal(null);
      Expect(res.status).to.equal(200);
      callback(res.body.session);
    });
}

function clearState(server, sessionId, callback) {
  var api = getAPIWithSessionId('/clearState', sessionId);
  server
    .get(api)
    .end(function (err, res) {
      Expect(err).to.equal(null);
      Expect(res.status).to.equal(200);
      Expect(res.text).to.equal('');
      callback();
    });
}

function getAPIWithSessionId(api, sessionId) {
  if (sessionId) {
    api += '?midwaySessionId=' + sessionId;
  }
  return api;
}
