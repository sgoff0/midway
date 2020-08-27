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

//TODO THIS FILE IS A HACK FOR HAPI CORS HEADERS AND SHOULD BE REMOVED ONCE FIXED BY HAPI
import * as _ from 'lodash';
import * as Logger from 'testarmada-midway-logger';

const CORS_HEADERS = {};
const HAPI_CORS_OPTIONS = ['origin', 'maxAge', 'headers', 'additionalHeaders', 'exposedHeaders', 'additionalExposedHeaders', 'credentials'];

const normalizeMethod = function (method) {
  if (method) {
    return method.toUpperCase();
  }
};

export default {

  HAPI_CORS_OPTIONS: HAPI_CORS_OPTIONS,

  setCorsHeaders: function (data) {
    const userCorsHeaders = getUsersCorsHeaders(data);
    Logger.debug('CORS headers to set as part of hack for path: ', data.path, 'and method: ', data.method, ' are: ', userCorsHeaders);

    if (!_.isEmpty(userCorsHeaders)) {
      const method = normalizeMethod(data.method) || 'GET';
      CORS_HEADERS[data.path] = CORS_HEADERS[data.path] || {};
      CORS_HEADERS[data.path][method] = userCorsHeaders;
    }
    Logger.debug('Updated Cors headers to set for routes: ', CORS_HEADERS);
  },

  getCorsHeaders: function (path, method) {
    method = normalizeMethod(method);
    const corsHeaders = (CORS_HEADERS[path] && CORS_HEADERS[path][method]) || {};
    Logger.debug('Headers for path: ' + path + ' and method: ' + method + ' are:', corsHeaders);
    return corsHeaders;
  }
};

function getUsersCorsHeaders(data) {
  const userCorsHeaders = {};
  if (data.config && data.config.cors) {
    const corsHeaders = data.config.cors;
    const hapiSupportedHeaders = {};
    Logger.debug('CORS headers passed in options: ', corsHeaders);
    for (const header in corsHeaders) {
      if (HAPI_CORS_OPTIONS.indexOf(header) === -1) {
        userCorsHeaders[header] = corsHeaders[header];
      } else {
        hapiSupportedHeaders[header] = corsHeaders[header];
      }
    }
    // Re-assign data cors headers to new value
    data.config.cors = hapiSupportedHeaders;
  }

  return userCorsHeaders;
}