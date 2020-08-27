
// const MidwayServer = require('./server-controller');
import MidwayServer from './server-controller';
import Plugin from './plugin';
import Utils from './utils/common-utils';
import SessionManager from './session-manager/session-manager';
import StateManager from './state-manager/state-manager';
import RoutesManager from './server-routes/midway-routes-manager';
import SessionInfo from './session-manager/session-info';
import MetricManager from './utils/metrics-manager';
import RepoUtil from './multiGitRepo/repo-util';
import Constants from './constants';
import Smocks from './smocks/index';
import * as Logger from 'testarmada-midway-logger';

const userRoutes = [];
const globalVariants = [];

//TODO THIS Require IS A HACK FOR HAPI CORS HEADERS AND SHOULD BE REMOVED ONCE FIXED BY HAPI
import CorsHeadersHack from './utils/cors-headers-hack';


class Midway {

  public server;

  public profile = Smocks.profile;

  public util = Utils;
  public log = Logger;

  private static instance: Midway;
  private constructor() {
  }
  public static getInstance(): Midway {
    if (!Midway.instance) {
      Midway.instance = new Midway();
    }
    return Midway.instance;
  }

  public id = (id) => {

    if (!id || Smocks._id) {
      return Smocks._id;
    }
    Smocks._id = id;
    return Smocks;
  }

  public start = (options, callback) => {
    Logger.debug('***************Starting Midway mocking server ***************');
    const midwayOptions = options || {};

    RepoUtil.handleMultipleRepos(midwayOptions).then(() => {
      midwayOptions.userRoutes = userRoutes;

      MidwayServer.start(midwayOptions, (server) => {
        this.server = server;
        if (callback) {
          return callback(this.server);
        }
      });
    }).catch((err) => {
      if (callback) {
        return callback(err);
      }
    });
  }

  public stop = (server, callback?) => {
    Logger.debug('***************Stopping Midway mocking server ***************');
    const serverToStop = server || this.server;
    MidwayServer.stop(serverToStop, callback);
  }

  public toPlugin = (hapiPluginOptions, options) => {
    const smocksOptions = options || {};
    smocksOptions.userRoutes = userRoutes;
    return Plugin.toPlugin(hapiPluginOptions, smocksOptions);
  }

  public route = (data) => {
    Logger.debug('Routes.....');
    Logger.debug(JSON.stringify(data, null, 2));

    //TODO THE FOLLOWING CALL IS A HACK FOR HAPI CORS HEADERS AND SHOULD BE REMOVED ONCE FIXED BY HAPI
    CorsHeadersHack.setCorsHeaders(data);

    const smockRouteObject = Smocks.route(data);

    if (RepoUtil.getMultiRepoDirectory()) {
      smockRouteObject.mockedDirectory = Constants.MULTI_REPOS_PATH + RepoUtil.getMultiRepoDirectory();
    }

    RoutesManager.addGlobalVariantForSingleRoute(globalVariants, smockRouteObject);

    if (!Utils.isServerRunning()) {
      const userRouteData = { 'routeObject': smockRouteObject, 'routeData': data };
      userRoutes.push(userRouteData);
    }

    return smockRouteObject;
  }

  public addGlobalVariant = (data) => {
    RoutesManager.addGlobalVariant(globalVariants, userRoutes, data);
  }

  // public plugin = (data) =>  {
  //   Smocks.plugin(data);
  // }

  public getRoute = (routeId) => {
    return Smocks.routes.get(routeId);
  }

  public setMockId = (mockId, sessionId) => {
    return Utils.setMockId(mockId, sessionId);
  }

  public getMockId = (sessionId) => {
    return Utils.getMockId(sessionId);
  }

  public resetMockId = (sessionId) => {
    return Utils.resetMockId(sessionId);
  }

  public resetMockVariantWithSession = (options, callback) => {
    Utils.resetMockVariantWithSession(options, (err, result) => {
      if (err) {
        return callback(err);
      }
      return callback(null, result);
    });
  }

  public setMockVariantWithSession = (options, callback) => {
    Utils.setMockVariantWithSession(options, (err, result) => {
      if (err) {
        return callback(err);
      }
      return callback(null, result);
    });
  }

  public setMockVariant = (options, callback) => {
    if (!options.mockPort) {
      options.mockPort = this.getPortInfo().httpPort;
    }
    Utils.setMockVariant(options, (err, result) => {
      if (err) {
        return callback(err);
      }
      return callback(null, result);
    });
  }

  public resetURLCount = (sessionId) => {
    return Utils.resetURLCount(sessionId);
  }

  public getURLCount = (sessionId) => {
    return Utils.getURLCount(sessionId);
  }

  public checkSession = (sessionId) => {
    return SessionManager.checkSession(sessionId);
  }

  public getSessions = () => {
    return SessionInfo.getSessions();
  }

  public registerSession = () => {
    return SessionManager.registerSession();
  }

  public closeSession = (sessionId, callback) => {
    return SessionManager.closeSession(sessionId, callback);
  }

  public clearSessions = () => {
    SessionManager.clearSessions();
  }

  public getProjectName = () => {
    return Utils.getProjectName();
  }

  public getPortInfo: any = () => {
    return Utils.getPortInfo();
  }

  public addState = (route, stateKey, stateValue) => {
    StateManager.addState(route, stateKey, stateValue);
  }

  public getState = (route, stateKey) => {
    return StateManager.getState(route, stateKey);
  }

  public clearState = (sessionId) => {
    StateManager.clearState(sessionId);
  }

  public enableMetrics = (collectMetrics) => {
    MetricManager.enableMetrics(collectMetrics);
  }

  public isMetricsEnabled = () => {
    return MetricManager.isMetricsEnabled();
  }

}

/*
const midwayInstance = {

  id: function (id) {

    if (!id || Smocks._id) {
      return Smocks._id;
    }
    Smocks._id = id;
    return Smocks;
  },

  start: function (options, callback) {
    Logger.debug('***************Starting Midway mocking server ***************');
    const midwayOptions = options || {};
    const self = this;

    RepoUtil.handleMultipleRepos(midwayOptions).then(function () {
      midwayOptions.userRoutes = userRoutes;

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

  stop: function (server, callback?) {
    Logger.debug('***************Stopping Midway mocking server ***************');
    const serverToStop = server || this.server;
    MidwayServer.stop(serverToStop, callback);
  },

  toPlugin: function (hapiPluginOptions, options) {
    const smocksOptions = options || {};
    smocksOptions.userRoutes = userRoutes;
    return Plugin.toPlugin(hapiPluginOptions, smocksOptions);
  },

  route: function (data) {
    Logger.debug('Routes.....');
    Logger.debug(JSON.stringify(data, null, 2));

    //TODO THE FOLLOWING CALL IS A HACK FOR HAPI CORS HEADERS AND SHOULD BE REMOVED ONCE FIXED BY HAPI
    CorsHeadersHack.setCorsHeaders(data);

    const smockRouteObject = Smocks.route(data);

    if (RepoUtil.getMultiRepoDirectory()) {
      smockRouteObject.mockedDirectory = Constants.MULTI_REPOS_PATH + RepoUtil.getMultiRepoDirectory();
    }

    RoutesManager.addGlobalVariantForSingleRoute(globalVariants, smockRouteObject);

    if (!Utils.isServerRunning()) {
      const userRouteData = { 'routeObject': smockRouteObject, 'routeData': data };
      userRoutes.push(userRouteData);
    }

    return smockRouteObject;
  },

  addGlobalVariant: function (data) {
    RoutesManager.addGlobalVariant(globalVariants, userRoutes, data);
  },

  // plugin: function (data) {
  //   Smocks.plugin(data);
  // },

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

  resetMockVariantWithSession: function (options, callback) {
    Utils.resetMockVariantWithSession(options, function (err, result) {
      if (err) {
        return callback(err);
      }
      return callback(null, result);
    });
  },

  setMockVariantWithSession: function (options, callback) {
    Utils.setMockVariantWithSession(options, function (err, result) {
      if (err) {
        return callback(err);
      }
      return callback(null, result);
    });
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

  profile: Smocks.profile,

  util: Utils,
  log: Logger
};
*/

// export default midwayInstance;
// To support js require without having to add .default
// module.exports = midwayInstance;
module.exports = Midway.getInstance();
export default Midway.getInstance();