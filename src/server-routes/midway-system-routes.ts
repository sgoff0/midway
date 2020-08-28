import Utils from './../utils/common-utils';
import SessionManager from './../session-manager/session-manager';
import SessionInfo from './../session-manager/session-info';
import * as Logger from 'testarmada-midway-logger';
import Constants from '../constants';
const config = {
  tags: ['api']
};

const routes = {
  setMockId: {
    id: 'Midway-SetMockId',
    label: 'Midway - Set Mock Id',
    path: Constants.MIDWAY_API_PATH + '/setMockId/{mockid}/{sessionid?}',
    config: config,
    handler: function (req, reply) {
      const mockid = req.params.mockid;
      const sessionId = getSessionIdFromRequest(req);

      Utils.setMockId(mockid, sessionId);
      const currentMockId = Utils.getMockId(sessionId);
      reply({ 'mockId': currentMockId }).code(200);
    }
  },

  getMockId: {
    id: 'Midway-GetMockId',
    label: 'Midway - Get Mock Id',
    path: Constants.MIDWAY_API_PATH + '/getMockId/{sessionid?}',
    config: config,
    handler: function (req, reply) {
      const sessionId = getSessionIdFromRequest(req);
      const currentMockId = Utils.getMockId(sessionId);
      //var currentMockId = getMockId(sessionId);
      reply({ 'mockId': currentMockId }).code(200);
    }
  },

  resetMockId: {
    id: 'Midway-ResetMockId',
    label: 'Midway - Reset Mock Id',
    path: Constants.MIDWAY_API_PATH + '/resetMockId/{sessionid?}',
    config: config,
    handler: function (req, reply) {
      const sessionId = getSessionIdFromRequest(req);
      Utils.resetMockId(sessionId);
      const currentMockId = Utils.getMockId(sessionId);
      reply({ 'mockId': currentMockId }).code(200);
    }
  },

  resetURLCount: {
    id: 'Midway-ResetURLCount',
    label: 'Midway - Reset URL Count',
    path: Constants.MIDWAY_API_PATH + '/resetURLCount/{sessionid?}',
    config: config,
    handler: function (req, reply) {
      const sessionId = getSessionIdFromRequest(req);
      Utils.resetURLCount(sessionId);
      const urlCounts = Utils.getURLCount(sessionId);
      reply(urlCounts).code(200);
    }
  },

  getURLCount: {
    id: 'Midway-GetURLCount',
    label: 'Midway - Get URL Count',
    path: Constants.MIDWAY_API_PATH + '/getURLCount/{sessionid?}',
    config: config,
    handler: function (req, reply) {
      const sessionId = getSessionIdFromRequest(req);
      const urlCounts = Utils.getURLCount(sessionId);
      reply(urlCounts).code(200);
    }
  },

  checkSession: {
    id: 'Midway-CheckSession',
    label: 'Midway - Check Session',
    path: Constants.MIDWAY_API_PATH + '/checkSession/{sessionid?}',
    config: config,
    handler: function (req, reply) {
      const sessionid = req.params.sessionid;
      const result = SessionManager.checkSession(sessionid);
      reply({ 'session-status': result }).code(200);
    }
  },

  getSessions: {
    id: 'Midway-GetSessions',
    label: 'Midway - Get Sessions',
    path: Constants.MIDWAY_API_PATH + '/getSessions',
    config: config,
    handler: function (req, reply) {
      const result = SessionInfo.getSessions();
      reply({ 'sessions': result }).code(200);
    }
  },

  registerSession: {
    id: 'Midway-RegisterSession',
    label: 'Midway - Register Session',
    path: Constants.MIDWAY_API_PATH + '/registerSession',
    config: config,
    handler: function (req, reply) {
      const result = SessionManager.registerSession();
      reply({ 'session': result }).code(200);
    }
  },

  closeSession: {
    id: 'Midway-CloseSession',
    label: 'Midway - Close Session',
    path: Constants.MIDWAY_API_PATH + '/closeSession/{sessionid?}',
    config: config,
    handler: function (req, reply) {
      const sessionId = req.params.sessionid;
      const mocksPort = req.query.mocksPort;
      const setPort = Utils.getPortInfo()[Constants.HTTP_PORT];

      function isHttpPortSet() {
        return setPort && setPort !== Constants.NOT_AVAILABLE;
      }

      // Set mocksPort, if not already set
      if (!isHttpPortSet() && mocksPort && parseInt(mocksPort) > 0) {
        Logger.info('Setting HTTP port to ', mocksPort);
        Utils.setHttpPort(parseInt(mocksPort));
      }

      SessionManager.closeSession(sessionId, function (result) {
        reply({ 'session': result }).code(200);
      });
    }
  },

  setLogLevel: {
    id: 'Midway-SetLogLevel',
    label: 'Midway - Set Log Level',
    path: Constants.MIDWAY_API_PATH + '/setloglevel/{loglevel}',
    config: config,
    handler: function (req, reply) {
      const loglevel = req.params.loglevel;
      Logger.setLogLevel(loglevel);
      reply({ 'loglevel': Logger.getLogLevel() }).code(200);
    }
  },

  getLogLevel: {
    id: 'Midway-GetLogLevel',
    label: 'Midway - Get Log Level',
    path: Constants.MIDWAY_API_PATH + '/getloglevel',
    config: config,
    handler: function (req, reply) {
      const result = Logger.getLogLevel();
      reply({ 'loglevel': result }).code(200);
    }
  },

  resetLogLevel: {
    id: 'Midway-ResetLogLevel',
    label: 'Midway - Reset Log Level',
    path: Constants.MIDWAY_API_PATH + '/resetloglevel',
    config: config,
    handler: function (req, reply) {
      Logger.resetLogLevel();
      reply({ 'loglevel': Logger.getLogLevel() }).code(200);
    }
  },

  wildCardSupport: {
    id: 'wildcard',
    method: '*',
    path: '/{p*}',
    label: 'Midway - Wildcard',
    handler: function (req, reply) {
      reply('No route defined in for this path').code(404).header(Constants.MOCKED_RESPONSE, false);
    }
  },

  adminRedirect: {
    id: 'admin-redirect',
    method: '*',
    path: '/_admin/{apiPath*}',
    label: 'Midway - Redirect',
    handler: function (req, reply) {
      Logger.info('Received /_admin request. Redirecting to /midway/' + req.params.apiPath);
      reply.redirect('/midway/' + req.params.apiPath);
    }
  }

};

function getSessionIdFromRequest(req) {
  let sessionId = req.params.sessionid;
  Logger.debug('Session id from request :' + sessionId);
  if (!sessionId || sessionId === Constants.SESSIONID) {
    sessionId = Constants.DEFAULT_SESSION;
  }
  Logger.debug('Setting session id to ' + sessionId);
  return sessionId;
}
export default routes;