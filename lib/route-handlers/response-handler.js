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
var Logger = require('testarmada-midway-logger');
var Constants = require('../constants');
var MetricManager = require('./../utils/metrics-manager');
var Utils = require('../utils/common-utils');

//TODO THIS Require IS A HACK FOR HAPI CORS HEADERS AND SHOULD BE REMOVED ONCE FIXED BY HAPI
var CorsHeadersHack = require('../utils/cors-headers-hack');


var ResponseHandler = function (request, reply) {
  setMockedResponseHeader(request);

  //TODO THIS API CALL IS A HACK FOR HAPI CORS HEADERS AND SHOULD BE REMOVED ONCE FIXED BY HAPI
  setHAPICorsHeadersHack(request);

  var collectMetrics = MetricManager.isMetricsEnabled();
  if (collectMetrics) {
    var metrics = MetricManager.getMetrics(request, Utils.getProjectName());
    if (metrics) {
      MetricManager.postToKairos(metrics);
    }
  }

  return reply.continue();
};

//TODO THIS FUNCTION IS A HACK FOR HAPI CORS HEADERS AND SHOULD BE REMOVED ONCE FIXED BY HAPI
function setHAPICorsHeadersHack(request) {
  // Remove session id from the front if present
  var routePath = Utils.getPathWithoutSessionId(request.route.path); // pathname does not have any query params
  var corsHeaders = CorsHeadersHack.getCorsHeaders(routePath, request.method);

  for (var header in corsHeaders) {
    request.response.header(header, corsHeaders[header]);
  }
}

function setMockedResponseHeader(request) {
  Logger.debug('Setting default header to show data is mocked for: ', request.url.path);
  if (request.response.headers && request.response.headers[Constants.MOCKED_RESPONSE] === undefined) {
    request.response.header(Constants.MOCKED_RESPONSE, true);
  }
}

module.exports = ResponseHandler;

