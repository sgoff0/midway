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
// make this file a module
import * as Logger from 'testarmada-midway-logger';
import * as MidwayUtil from 'testarmada-midway-util';

import Utils from './../utils/common-utils';
import SessionInfo from './session-info';
import StateManager from './../state-manager/state-manager';
import Constants from '../constants';
import MidwayRoutesInfo from '../server-routes/midway-routes-info';

let midwaySessions = {};
const sessionState = { 'available': 'AVAILABLE', 'inuse': 'IN_USE', 'invalid': 'DOES_NOT_EXISTS', 'busy': 'NOT_AVAILABLE' };
const Async = require('async');

export default {
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
    for (let count = 0; count < sessionCount; count++) {
      const sessionId = MidwayUtil.generateUniqueId();
      midwaySessions[sessionId] = sessionState.available;
      Logger.debug('Adding session: ' + sessionId);
    }

    SessionInfo.setSession(midwaySessions);
    return midwaySessions;
  },

  registerSession: function () {
    for (const sessionId in midwaySessions) {
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

        // Setting variants to default
        const sessionRoutes = MidwayRoutesInfo.getUserRoutesForSession(sessionId);
        const nonDefaultVariantRoutes = [];
        for (const route in sessionRoutes) {
          if (sessionRoutes[route]._activeVariant !== 'default') {
            nonDefaultVariantRoutes.push(sessionRoutes[route]._id);
          }
        }

        const setMockVariantIterator = function (routeId, next) {
          const setVariantOptions = {};
          setVariantOptions[Constants.MOCK_PORT] = Utils.getPortInfo()[Constants.HTTP_PORT];
          setVariantOptions[Constants.VARIANT] = Constants.DEFAULT_VARIANT;
          setVariantOptions[Constants.FIXTURE] = routeId;

          Logger.debug('Setting default variant for route: ', routeId);

          Utils.setMockVariant(setVariantOptions, function (err) {
            Logger.debug('Post call done for Set mock variant: ', setVariantOptions);
            if (err) {
              Logger.debug(err);
              return next(err);

            }
            next();
          });
        };

        const afterAsyncCallBack = function (err) {
          if (err) {
            return callback(err);
          }
          Logger.debug('Calling final callback after setting all routes variants to default for sessionId: ' + sessionId);
          midwaySessions[sessionId] = sessionState.available;
          return callback(sessionState.available);
        };

        // Setting all variants to default
        Logger.info('Setting variants to default for all routes for sessionId:', sessionId);
        Async.each(nonDefaultVariantRoutes, setMockVariantIterator, afterAsyncCallBack);

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