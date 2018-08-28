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
var midway = require('../../lib/index');
var StateManager = require('../../lib/state-manager/state-manager');
var Constants = require('../../lib/constants');
var path;
var sessionId;
require('../../resources/run-mock-server-api-dynamic.js');


describe('state-manager-api-tests - ', function () {
  var route = {
    variant: {
      _route: {
        path: function () {
          return path;
        }
      }
    }
  };

  afterEach(function (done) {
    StateManager.clearState(sessionId);
    done();
  });

  it('Check state is set for default session if path does not have session Id', function (done) {
    path = '/test';
    sessionId = Constants.DEFAULT_SESSION;
    StateManager.addState(route, 'stateKey1', 'stateValue1');
    var state = StateManager.getState(route, 'stateKey1');
    Expect(state).to.equal('stateValue1');
    done();
  });

  it('Check state can be set again for default session if path does not have session Id', function (done) {
    path = '/test';
    sessionId = Constants.DEFAULT_SESSION;
    StateManager.addState(route, 'stateKey1', 'stateValue1');
    StateManager.addState(route, 'stateKey2', 'stateValue2');
    var state1 = StateManager.getState(route, 'stateKey1');
    var state2 = StateManager.getState(route, 'stateKey2');
    Expect(state1).to.equal('stateValue1');
    Expect(state2).to.equal('stateValue2');
    done();
  });

  it('Check state can is retrieved for default session if path does not have session Id', function (done) {
    path = '/test';
    sessionId = Constants.DEFAULT_SESSION;
    StateManager.addState(route, 'stateKey1', 'stateValue1');
    var state1 = StateManager.getState(route, 'stateKey1');
    Expect(state1).to.equal('stateValue1');
    done();
  });

  it('Check state can be set for a given session', function (done) {
    var session = midway.registerSession();
    sessionId = session;
    path = '/' + session + '/test';
    StateManager.addState(route, 'stateKey1', 'stateValue1');
    var state1 = StateManager.getState(route, 'stateKey1');
    Expect(state1).to.equal('stateValue1');
    closeSession(session, done);
  });

  it('Check state is undefined if state is not set for a given session', function (done) {
    var session = midway.registerSession();
    sessionId = session;
    path = '/' + session + '/test';
    var state1 = StateManager.getState(route, 'stateKey1');
    Expect(state1).to.equal(undefined);
    closeSession(session, done);
  });

  it('Check state is cleared only for default session if no session is passed', function (done) {
    var session = midway.registerSession();
    sessionId = session;

    path = '/' + session + '/test';
    StateManager.addState(route, 'stateKey1', 'stateValue1');
    var state1 = StateManager.getState(route, 'stateKey1');
    Expect(state1).to.equal('stateValue1');

    path = '/test';
    StateManager.addState(route, 'stateKey2', 'stateValue2');
    var state2 = StateManager.getState(route, 'stateKey2');
    Expect(state2).to.equal('stateValue2');

    StateManager.clearState();

    path = '/' + session + '/test';
    var stateShouldBeDefined = StateManager.getState(route, 'stateKey1');
    Expect(stateShouldBeUndefined).to.equal(undefined);

    path = '/test';
    var stateShouldBeUndefined = StateManager.getState(route, 'stateKey2');
    Expect(stateShouldBeDefined).to.equal('stateValue1');

    closeSession(session, done);
  });

  it('Check state is cleared only for session if session is passed', function (done) {
    var session = midway.registerSession();
    sessionId = Constants.DEFAULT_SESSION;

    path = '/' + session + '/test';
    StateManager.addState(route, 'stateKey1', 'stateValue1');
    var state1 = StateManager.getState(route, 'stateKey1');
    Expect(state1).to.equal('stateValue1');

    path = '/test';
    StateManager.addState(route, 'stateKey2', 'stateValue2');
    var state2 = StateManager.getState(route, 'stateKey2');
    Expect(state2).to.equal('stateValue2');

    StateManager.clearState(session);

    path = '/' + session + '/test';
    var stateShouldBeUndefined = StateManager.getState(route, 'stateKey1');
    Expect(stateShouldBeUndefined).to.equal(undefined);

    path = '/test';
    var stateShouldBeDefined = StateManager.getState(route, 'stateKey2');
    Expect(stateShouldBeDefined).to.equal('stateValue2');

    closeSession(session, done);
  });
});

function closeSession(sessionId, callback) {
  midway.closeSession(sessionId, function () {
    callback();
  });
}

