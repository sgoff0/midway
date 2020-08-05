import * as Logger from 'testarmada-midway-logger';
import * as MidwayUtil from 'testarmada-midway-util';

import Utils from './../utils/common-utils';
import SessionInfo from './session-info';
import StateManager from './../state-manager/state-manager';
import Constants from '../constants';
import MidwayRoutesInfo from '../server-routes/midway-routes-info';

const sessionState = { 'available': 'AVAILABLE', 'inuse': 'IN_USE', 'invalid': 'DOES_NOT_EXISTS', 'busy': 'NOT_AVAILABLE' };
const Async = require('async');

class SessionManager {
  private midwaySessions = {};
  public SESSION_STATE = sessionState;

  public checkSession = (sessionId) => {
    if (sessionId in this.midwaySessions) {
      return this.midwaySessions[sessionId];
    } else {
      Logger.debug('No session id with value: ' + sessionId);
      return sessionState.invalid;
    }
  }

  public addSessions = (sessionCount) => {
    for (let count = 0; count < sessionCount; count++) {
      const sessionId = MidwayUtil.generateUniqueId();
      this.midwaySessions[sessionId] = sessionState.available;
      Logger.debug('Adding session: ' + sessionId);
    }

    SessionInfo.setSession(this.midwaySessions);
    return this.midwaySessions;
  }

  public registerSession = () => {
    for (const sessionId in this.midwaySessions) {
      if (this.midwaySessions[sessionId] == sessionState.available) {
        Logger.info('Registering session: ' + sessionId);
        this.midwaySessions[sessionId] = sessionState.inuse;
        return sessionId;
      }
    }

    Logger.info('No Sessions are available');
    return sessionState.busy;
  }

  public closeSession = (sessionId, callback) => {
    if (sessionId in this.midwaySessions) {
      if (this.midwaySessions[sessionId] !== sessionState.available) {
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
          this.midwaySessions[sessionId] = sessionState.available;
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
  }

  public clearSessions = () => {
    this.midwaySessions = {};
  }
};

export default new SessionManager();