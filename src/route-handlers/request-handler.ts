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
const Url = require('url');
const Querystring = require('querystring');
import * as Logger from 'testarmada-midway-logger';

const RequestHandler = function (request, h) {
  // Route all requests to sessions if server is running with sessions

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

  /**
  *
  * /xyxwe/getPage?midwaySessionId=abcdef
  *
  *
  * abcdef/xyxwe/getPage?midwaySessionId=abcdef
  *
  *
  *
  *
  * xyxwe
  * abcdef
  * abcdeasd
  * wdfsdfsf
  *
  *
  *
  */
  //TODO
  const midwaySessionId = extractSessionIdFromRequest();
  console.log("Midway session id");
  console.warn("Temporarily skipping request handler");

  Logger.debug('Midway Session ID:' + midwaySessionId + ' , for request url :' + request.url.path);
  // try {
  //   if (midwaySessionId && !request.url.path.startsWith('/' + midwaySessionId)) {
  //     Logger.debug('Prepending  Session ID:' + midwaySessionId + ' to ' + request.url.path);
  //     const updatedUrl = prependSessionId(request.url.path, midwaySessionId);
  //     request.setUrl(updatedUrl);
  //     return h.continue;
  //   }
  // } catch (e) {
  //   Logger.debug(e);
  // }
  // return h.continue;
};

export default RequestHandler;