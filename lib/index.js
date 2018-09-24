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
'use strict';
var MidwayServer = require('./server-controller');
var Plugin = require('./plugin');
var Utils = require('./utils/common-utils');
var Smocks = require('testarmada-midway-smocks');
var Logger = require('testarmada-midway-logger');
var SessionManager = require('./session-manager/session-manager');
var StateManager = require('./state-manager/state-manager');
var RoutesManager = require('./server-routes/midway-routes-manager');
var MidwayRoutesInfo = require('./server-routes/midway-routes-info');
var SessionInfo = require('./session-manager/session-info');
var MetricManager = require('./utils/metrics-manager');
var RepoUtil = require('./multiGitRepo/repo-util');
var Constants = require('./constants');
var userRoutes = [];
var globalVariants = [];

//TODO THIS Require IS A HACK FOR HAPI CORS HEADERS AND SHOULD BE REMOVED ONCE FIXED BY HAPI
var CorsHeadersHack = require('./utils/cors-headers-hack');

var midwayInstance = module.exports = {

  id: function (id) {

    if (!id || Smocks._id) {
      return Smocks._id;
    }
    Smocks._id = id;
    return Smocks;
  },

  start: function (options, callback) {
    Logger.debug('***************Starting Midway mocking server ***************');
    var midwayOptions = options || {};
    var self = this;

    RepoUtil.handleMultipleRepos(midwayOptions).then(function () {
      midwayOptions.userRoutes = userRoutes;

      MidwayRoutesInfo.setUserRoutes(midwayOptions.userRoutes);
      MidwayServer.start(midwayOptions, function (server) {
        self.server = server;
        if (callback) {
          return callback(self.server);
        }
      });
    }).catch(function (err) {
      if (callback) {
        return callback(err);
      }
    });
  },

  stop: function (server, callback) {
    Logger.debug('***************Stopping Midway mocking server ***************');
    var serverToStop = server || this.server;
    MidwayServer.stop(serverToStop, callback);
  },

  toPlugin: function (hapiPluginOptions, options) {
    var smocksOptions = options || {};
    smocksOptions.userRoutes = userRoutes;
    return Plugin.toPlugin(hapiPluginOptions, smocksOptions);
  },

  route: function (data) {
    Logger.debug('Routes.....');
    Logger.debug(JSON.stringify(data, null, 2));

    //TODO THE FOLLOWING CALL IS A HACK FOR HAPI CORS HEADERS AND SHOULD BE REMOVED ONCE FIXED BY HAPI
    CorsHeadersHack.setCorsHeaders(data);

    var smockRouteObject = Smocks.route(data);

    if (RepoUtil.getMultiRepoDirectory()) {
      smockRouteObject.mockedDirectory = Constants.MULTI_REPOS_PATH + RepoUtil.getMultiRepoDirectory();
    }

    RoutesManager.addGlobalVariantForSingleRoute(globalVariants, smockRouteObject);

    if (!Utils.isServerRunning()) {
      var userRouteData = {'routeObject': smockRouteObject, 'routeData': data};
      userRoutes.push(userRouteData);
    }

    return smockRouteObject;
  },

  addGlobalVariant: function (data) {
    RoutesManager.addGlobalVariant(globalVariants, userRoutes, data);
  },

  plugin: function (data) {
    Smocks.plugin(data);
  },

  getRoute: function (routeId) {
    return Smocks.routes.get(routeId);
  },

  setMockId: function (mockId, sessionId) {
    return Utils.setMockId(mockId, sessionId);
  },

  getMockId: function (sessionId) {
    return Utils.getMockId(sessionId);
  },

  resetMockId: function (sessionId) {
    return Utils.resetMockId(sessionId);
  },

  setMockVariant: function (options, callback) {
    if (!options.mockPort) {
      options.mockPort = this.getPortInfo().httpPort;
    }
    Utils.setMockVariant(options, function (err, result) {
      if (err) {
        return callback(err);
      }
      return callback(null, result);
    });
  },

  resetAllVariants: function (sessionId, callback) {
    // If only 1 argument is passed, session id is 'default'. Users don't need to pass it explicitly
    // arguments is implicit argument passed to all functions
    if (arguments.length === 1) {
      callback = sessionId;
      sessionId = Constants.DEFAULT_SESSION;
    }
    if (typeof callback !== 'function') {
      throw new Error('Callback to resetAllVariants shoud be a function');
    }

    return Utils.resetAllVariants(sessionId, callback);
  },

  resetURLCount: function (sessionId) {
    return Utils.resetURLCount(sessionId);
  },

  getURLCount: function (sessionId) {
    return Utils.getURLCount(sessionId);
  },

  checkSession: function (sessionId) {
    return SessionManager.checkSession(sessionId);
  },

  getSessions: function () {
    return SessionInfo.getSessions();
  },

  registerSession: function () {
    return SessionManager.registerSession();
  },

  closeSession: function (sessionId, callback) {
    return SessionManager.closeSession(sessionId, callback);
  },

  clearSessions: function () {
    SessionManager.clearSessions();
  },

  getProjectName: function () {
    return Utils.getProjectName();
  },

  getPortInfo: function () {
    return Utils.getPortInfo();
  },

  addState: function (route, stateKey, stateValue) {
    StateManager.addState(route, stateKey, stateValue);
  },

  getState: function (route, stateKey) {
    return StateManager.getState(route, stateKey);
  },

  clearState: function (sessionId) {
    StateManager.clearState(sessionId);
  },

  enableMetrics: function (collectMetrics) {
    MetricManager.enableMetrics(collectMetrics);
  },

  isMetricsEnabled: function () {
    return MetricManager.isMetricsEnabled();
  },

  util: Utils,
  log: Logger
};

module.exports = midwayInstance;
