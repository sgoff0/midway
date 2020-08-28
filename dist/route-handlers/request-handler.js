"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Url = require("url");
const Querystring = require("querystring");
const Logger = require("testarmada-midway-logger");
const RequestHandler = (request, h) => {
    function prependSessionId(url, sessionId) {
        if (sessionId && !url.startsWith('/' + sessionId)) {
            url = '/' + sessionId + url;
        }
        return url;
    }
    function getSessionIdFromQuery() {
        return request.query && request.query.midwaySessionId;
    }
    function getSessionIdFromHeaders() {
        let midwaySessionId;
        try {
            if (request.headers['x-request-page-params']) {
                const reqParams = JSON.parse(request.headers['x-request-page-params']);
                midwaySessionId = reqParams.midwaySessionId;
            }
            else {
                Logger.debug('Header \'x-request-page-params\' does not exist');
            }
        }
        catch (e) {
            Logger.debug('Error in parsing headers for x-request-page-params');
            Logger.debug(e);
        }
        return midwaySessionId;
    }
    function getSessionIdFromReferer() {
        let midwaySessionId;
        try {
            if (request.headers.referer) {
                const urlObj = Url.parse(request.headers.referer);
                const query = Querystring.parse(urlObj.query);
                midwaySessionId = query.midwaySessionId;
            }
            else {
                Logger.debug('Header \'referrer\' does not exist');
            }
        }
        catch (e) {
            Logger.debug('Error in parsing headers for referer');
            Logger.debug(e);
        }
        return midwaySessionId;
    }
    function extractSessionIdFromRequest() {
        return getSessionIdFromQuery() || getSessionIdFromHeaders() || getSessionIdFromReferer();
    }
    const midwaySessionId = extractSessionIdFromRequest();
    Logger.debug('Midway Session ID:' + midwaySessionId + ' , for request url :' + request.url.path);
    Logger.warn("Disabled reply.continue() but didn't fix");
};
exports.default = RequestHandler;
//# sourceMappingURL=request-handler.js.map