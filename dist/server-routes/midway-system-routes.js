"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_utils_1 = require("./../utils/common-utils");
const session_manager_1 = require("./../session-manager/session-manager");
const session_info_1 = require("./../session-manager/session-info");
const Logger = require("testarmada-midway-logger");
const constants_1 = require("../constants");
const config = {
    tags: ['api']
};
const routes = {
    setMockId: {
        id: 'Midway-SetMockId',
        label: 'Midway - Set Mock Id',
        path: constants_1.default.MIDWAY_API_PATH + '/setMockId/{mockid}/{sessionid?}',
        config: config,
        handler: function (req, h) {
            const mockid = req.params.mockid;
            const sessionId = getSessionIdFromRequest(req);
            common_utils_1.default.setMockId(mockid, sessionId);
            const currentMockId = common_utils_1.default.getMockId(sessionId);
            return h.response({ 'mockId': currentMockId }).code(200);
        }
    },
    getMockId: {
        id: 'Midway-GetMockId',
        label: 'Midway - Get Mock Id',
        path: constants_1.default.MIDWAY_API_PATH + '/getMockId/{sessionid?}',
        config: config,
        handler: function (req, h) {
            const sessionId = getSessionIdFromRequest(req);
            const currentMockId = common_utils_1.default.getMockId(sessionId);
            return h.response({ 'mockId': currentMockId }).code(200);
        }
    },
    resetMockId: {
        id: 'Midway-ResetMockId',
        label: 'Midway - Reset Mock Id',
        path: constants_1.default.MIDWAY_API_PATH + '/resetMockId/{sessionid?}',
        config: config,
        handler: function (req, h) {
            const sessionId = getSessionIdFromRequest(req);
            common_utils_1.default.resetMockId(sessionId);
            const currentMockId = common_utils_1.default.getMockId(sessionId);
            return h.response({ 'mockId': currentMockId }).code(200);
        }
    },
    resetURLCount: {
        id: 'Midway-ResetURLCount',
        label: 'Midway - Reset URL Count',
        path: constants_1.default.MIDWAY_API_PATH + '/resetURLCount/{sessionid?}',
        config: config,
        handler: function (req, h) {
            const sessionId = getSessionIdFromRequest(req);
            common_utils_1.default.resetURLCount(sessionId);
            const urlCounts = common_utils_1.default.getURLCount(sessionId);
            return h.response(urlCounts).code(200);
        }
    },
    getURLCount: {
        id: 'Midway-GetURLCount',
        label: 'Midway - Get URL Count',
        path: constants_1.default.MIDWAY_API_PATH + '/getURLCount/{sessionid?}',
        config: config,
        handler: function (req, h) {
            const sessionId = getSessionIdFromRequest(req);
            const urlCounts = common_utils_1.default.getURLCount(sessionId);
            return h.response(urlCounts).code(200);
        }
    },
    checkSession: {
        id: 'Midway-CheckSession',
        label: 'Midway - Check Session',
        path: constants_1.default.MIDWAY_API_PATH + '/checkSession/{sessionid?}',
        config: config,
        handler: function (req, h) {
            const sessionid = req.params.sessionid;
            const result = session_manager_1.default.checkSession(sessionid);
            return h.response({ 'session-status': result }).code(200);
        }
    },
    getSessions: {
        id: 'Midway-GetSessions',
        label: 'Midway - Get Sessions',
        path: constants_1.default.MIDWAY_API_PATH + '/getSessions',
        config: config,
        handler: function (req, h) {
            const result = session_info_1.default.getSessions();
            return h.response({ 'sessions': result }).code(200);
        }
    },
    registerSession: {
        id: 'Midway-RegisterSession',
        label: 'Midway - Register Session',
        path: constants_1.default.MIDWAY_API_PATH + '/registerSession',
        config: config,
        handler: function (req, h) {
            const result = session_manager_1.default.registerSession();
            return h.response({ 'session': result }).code(200);
        }
    },
    closeSession: {
        id: 'Midway-CloseSession',
        label: 'Midway - Close Session',
        path: constants_1.default.MIDWAY_API_PATH + '/closeSession/{sessionid?}',
        config: config,
        handler: function (req, h) {
            Logger.warn("Fix me to not use callback");
            const sessionId = req.params.sessionid;
            const mocksPort = req.query.mocksPort;
            const setPort = common_utils_1.default.getPortInfo()[constants_1.default.HTTP_PORT];
            function isHttpPortSet() {
                return setPort && setPort !== constants_1.default.NOT_AVAILABLE;
            }
            if (!isHttpPortSet() && mocksPort && parseInt(mocksPort) > 0) {
                Logger.info('Setting HTTP port to ', mocksPort);
                common_utils_1.default.setHttpPort(parseInt(mocksPort));
            }
            session_manager_1.default.closeSession(sessionId, function (result) {
                h.response({ 'session': result }).code(200);
            });
        }
    },
    setLogLevel: {
        id: 'Midway-SetLogLevel',
        label: 'Midway - Set Log Level',
        path: constants_1.default.MIDWAY_API_PATH + '/setloglevel/{loglevel}',
        config: config,
        handler: function (req, h) {
            const loglevel = req.params.loglevel;
            Logger.setLogLevel(loglevel);
            return h.response({ 'loglevel': Logger.getLogLevel() }).code(200);
        }
    },
    getLogLevel: {
        id: 'Midway-GetLogLevel',
        label: 'Midway - Get Log Level',
        path: constants_1.default.MIDWAY_API_PATH + '/getloglevel',
        config: config,
        handler: function (req, h) {
            const result = Logger.getLogLevel();
            return h.response({ 'loglevel': result }).code(200);
        }
    },
    resetLogLevel: {
        id: 'Midway-ResetLogLevel',
        label: 'Midway - Reset Log Level',
        path: constants_1.default.MIDWAY_API_PATH + '/resetloglevel',
        config: config,
        handler: function (req, h) {
            Logger.resetLogLevel();
            return h.response({ 'loglevel': Logger.getLogLevel() }).code(200);
        }
    },
    wildCardSupport: {
        id: 'wildcard',
        method: '*',
        path: '/{p*}',
        label: 'Midway - Wildcard',
        handler: function (req, h) {
            return h.response('No route defined in for this path').code(404).header(constants_1.default.MOCKED_RESPONSE, 'false');
        }
    },
    adminRedirect: {
        id: 'admin-redirect',
        method: '*',
        path: '/_admin/{apiPath*}',
        label: 'Midway - Redirect',
        handler: function (req, h) {
            Logger.info('Received /_admin request. Redirecting to /midway/' + req.params.apiPath);
            return h.redirect('/midway/' + req.params.apiPath);
        }
    }
};
function getSessionIdFromRequest(req) {
    let sessionId = req.params.sessionid;
    Logger.debug('Session id from request :' + sessionId);
    if (!sessionId || sessionId === constants_1.default.SESSIONID) {
        sessionId = constants_1.default.DEFAULT_SESSION;
    }
    Logger.debug('Setting session id to ' + sessionId);
    return sessionId;
}
exports.default = routes;
//# sourceMappingURL=midway-system-routes.js.map