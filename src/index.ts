
import MidwayServer from './server-controller';
import Plugin from './plugin';
import Utils from './utils/common-utils';
import SessionManager from './session-manager/session-manager';
import StateManager from './state-manager/state-manager';
import * as RoutesManager from './server-routes/midway-routes-manager';
import SessionInfo from './session-manager/session-info';
import RepoUtil from './multiGitRepo/repo-util';
import Constants from './constants';
import Smocks from './smocks/index';
import * as Logger from 'testarmada-midway-logger';
import * as Hapi from '@hapi/hapi';

const userRoutes = [];
const globalVariants = [];

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

  public start = async (options) => {
    Logger.debug('***************Starting Midway mocking server ***************');
    const midwayOptions = options || {};

    // RepoUtil.handleMultipleRepos(midwayOptions).then(() => {
    //   midwayOptions.userRoutes = userRoutes;

    //   MidwayServer.start(midwayOptions, (server: Hapi.Server) => {
    //     this.server = server;
    //     if (callback) {
    //       return callback(this.server);
    //     }
    //   });
    // }).catch((err) => {
    //   if (callback) {
    //     return callback(err);
    //   }
    // });
    await RepoUtil.handleMultipleRepos(midwayOptions);
    midwayOptions.userRoutes = userRoutes;
    const server = await MidwayServer.start(midwayOptions);
    this.server = server;
    return server;

  }

  public stop = (server: Hapi.Server, callback?) => {
    Logger.debug('***************Stopping Midway mocking server ***************');
    const serverToStop = server || this.server;
    MidwayServer.stop(serverToStop);
  }

  public toPlugin = (hapiPluginOptions, options) => {
    const smocksOptions = options || {};
    smocksOptions.userRoutes = userRoutes;
    return Plugin.toPlugin(hapiPluginOptions, smocksOptions);
  }

  public route = (data) => {
    Logger.debug('Routes.....');
    Logger.debug(JSON.stringify(data, null, 2));

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

}
export default Midway.getInstance();