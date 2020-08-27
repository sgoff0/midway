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
export { };
const _ = require('lodash');

let COOKIE_STATE_KEY;
const MACHINE_ID = Math.floor(Math.random() * 1000000) + '';

const STATES = {};

function StateManager(options) {
  options = options || {};
  this.timeout = options.timeout || 8 * 60 * 60 * 1000;
  this.maxSessions = options.maxSessions || 30;
}
_.extend(StateManager.prototype, {

  initialize: function (request, callback) {
    if (!COOKIE_STATE_KEY) {
      const smocks = require('../index');
      COOKIE_STATE_KEY = '_smocks_state_' + smocks.id();
    }

    const sessionId = request.state[COOKIE_STATE_KEY];
    const doInitialize = !sessionId || !STATES[sessionId];
    if (doInitialize) {
      const newStateId = guid();
      request._smocksInitialized = newStateId;
    }
    callback(undefined, doInitialize);
  },

  onResponse: function (request, reply) {
    const newStateId = request._smocksInitialized;
    if (newStateId) {
      reply.state(COOKIE_STATE_KEY, newStateId, { encoding: 'none', clearInvalid: true, path: '/' });
    }
    reply.state('__smocks_container_id', MACHINE_ID, { encoding: 'none', clearInvalid: true, path: '/' });
    reply.state('__smocks_state', 'cookie', { encoding: 'none', clearInvalid: true, path: '/' });

    this._cleanup();
  },

  userState: function (request) {
    return this._getStateValue('userState', request);
  },

  resetUserState: function (request, initialState) {
    this._clearStateValue('userState', request, initialState);
  },

  routeState: function (request) {
    return this._getStateValue('routeState', request);
  },

  resetRouteState: function (request) {
    this._clearStateValue('routeState', request);
  },

  _getStateValue: function (key, request) {
    const state = this._getState(request);
    let rtn = state[key];
    if (!rtn) {
      state[key] = {};
      rtn = state[key];
    }
    return rtn;
  },

  _clearStateValue: function (key, request, seed) {
    const state = this._getState(request);
    state[key] = seed || {};
  },

  _getState: function (request) {
    const stateId = request._smocksInitialized || request.state[COOKIE_STATE_KEY];
    let container = STATES[stateId];
    if (!container) {
      container = {
        lastAccess: new Date().getTime(),
        state: {}
      };
      STATES[stateId] = container;
    } else {
      container.lastAccess = new Date().getTime();
    }
    return container.state;
  },

  _cleanup: function () {
    const toDelete = {};
    let statesLength = 0;
    const clearIfBefore = new Date().getTime() - this.timeout;
    _.each(STATES, function (data, token) {
      if (data.lastAccess < clearIfBefore) {
        toDelete[token] = true;
      } else {
        statesLength++;
      }
    });
    _.each(toDelete, function (value, token) {
      delete STATES[token];
    });

    function clearLastState() {
      let leastTime = -1;
      let leastToken;
      _.each(STATES, function (data, token) {
        if (leastTime === -1 || data.lastAccess < leastTime) {
          leastTime = data.lastAccess;
          leastToken = token;
        }
      });
      if (leastToken) {
        delete STATES[leastToken];
      }
    }

    while (statesLength > this.maxSessions) {
      clearLastState();
      statesLength--;
    }
  }
});

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

module.exports = StateManager;