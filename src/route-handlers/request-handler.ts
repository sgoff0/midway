import * as Url from 'url';
import * as Querystring from 'querystring';
import * as Logger from 'testarmada-midway-logger';
import * as Hapi from '@hapi/hapi';

const RequestHandler = (request, h: Hapi.ResponseToolkit) => {
  // Route all requests to sessions if server is running with sessions

  // function prependSessionId(url, sessionId): string {
  //   if (sessionId && !url.startsWith('/' + sessionId)) {
  //     url = '/' + sessionId + url;
  //   }
  //   return url;
  // }

  function getSessionIdFromQuery() {
    return request.query && request.query.midwaySessionId;
  }

  function getSessionIdFromHeaders() {
    let midwaySessionId;
    try {
      if (request.headers['x-request-page-params']) {
        const reqParams = JSON.parse(request.headers['x-request-page-params']);
        midwaySessionId = reqParams.midwaySessionId;
      } else {
        Logger.debug('Header \'x-request-page-params\' does not exist');
      }
    } catch (e) {
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
      } else {
        Logger.debug('Header \'referrer\' does not exist');
      }
    } catch (e) {
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
  // TODO sgoff0 address me
  Logger.warn("Disabled reply.continue() but didn't fix");
  // try {
  //   if (midwaySessionId && !request.url.path.startsWith('/' + midwaySessionId)) {
  //     Logger.debug('Prepending  Session ID:' + midwaySessionId + ' to ' + request.url.path);
  //     const updatedUrl = prependSessionId(request.url.path, midwaySessionId);
  //     request.setUrl(updatedUrl);
  //     return reply.continue();
  //   }
  // } catch (e) {
  //   Logger.debug(e);
  // }
  // return reply.continue();
};

export default RequestHandler;