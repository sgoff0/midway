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
var Logger = require('testarmada-midway-logger');
var MidwayUtil = require('testarmada-midway-util');
var Utils = require('./../utils/common-utils');
var SessionInfo = require('./session-info');
var StateManager = require('./../state-manager/state-manager');
var midwaySessions = {};
var sessionState = {'available': 'AVAILABLE', 'inuse': 'IN_USE', 'invalid': 'DOES_NOT_EXISTS', 'busy': 'NOT_AVAILABLE'};

module.exports = {
  SESSION_STATE: sessionState,

  checkSession: function (sessionId) {
    if (sessionId in midwaySessions) {
      return midwaySessions[sessionId];
    } else {
      Logger.debug('No session id with value: ' + sessionId);
      return sessionState.invalid;
    }
  },

  addSessions: function (sessionCount) {
    for (var count = 0; count < sessionCount; count++) {
      var sessionId = MidwayUtil.generateUniqueId();
      midwaySessions[sessionId] = sessionState.available;
      Logger.debug('Adding session: ' + sessionId);
    }

    SessionInfo.setSession(midwaySessions);
    return midwaySessions;
  },

  registerSession: function () {
    for (var sessionId in midwaySessions) {
      if (midwaySessions[sessionId] == sessionState.available) {
        Logger.info('Registering session: ' + sessionId);
        midwaySessions[sessionId] = sessionState.inuse;
        return sessionId;
      }
    }

    Logger.info('No Sessions are available');
    return sessionState.busy;
  },

  closeSession: function (sessionId, callback) {
    if (sessionId in midwaySessions) {
      if (midwaySessions[sessionId] !== sessionState.available) {
        Logger.info('Closing session: ' + sessionId);

        Utils.resetMockId(sessionId);
        Utils.resetURLCount(sessionId);

        // Clearing session state
        StateManager.clearState(sessionId);

        // TODO - Test this thoroughly
        Utils.resetAllVariants(sessionId, function (err) {
          if (err) {
            return callback(err);
          }
          Logger.debug('Calling final callback after setting all routes variants to default for sessionId: ' + sessionId);

          // Make sessions available
          midwaySessions[sessionId] = sessionState.available;
          return callback(sessionState.available);
        });

      } else {
        Logger.debug('Session id : ' + sessionId + ' is already available');
        return callback(sessionState.available);
      }

    } else {
      Logger.debug('No session id with value: ' + sessionId);
      return callback(sessionState.invalid);
    }
  },

  clearSessions: function () {
    midwaySessions = {};
  }
};
