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
import * as _ from 'lodash';
import Constants from '../constants';
const Utils = require('./common-utils');
import * as Logger from 'testarmada-midway-logger';
const request = require('request');

export default {

  getMetrics: function (request, projectName) {
    let metrics;
    if (request.path.indexOf(Constants.MIDWAY_API_PATH) < 0 && request.path.indexOf('/_admin') < 0 && request.path.indexOf('/midway') < 0 && request.route.path.indexOf('/{p*}') < 0) {// midway intercepts _admin before redirecting to /midway.  to do - tke care of root path
      metrics = generateMetricKeys(request.route.path, request.paramsArray, projectName);
    }
    return metrics;
  },

  enableMetrics: function (collectMetrics) {
    this.collectMetrics = collectMetrics;
  },

  isMetricsEnabled: function () {
    return this.collectMetrics;
  },

  postToKairos: function (metrics, callback?) {
    const metricArrayForKairos = [];

    metrics.forEach(function (metric) {
      const obj = {
        name: metric,
        tags: {
          profile: 'default',
          sequence: 0
        },
        timestamp: new Date().getTime(),
        value: 1
      };
      metricArrayForKairos.push(obj);
    });

    const requestOptions = {
      body: metricArrayForKairos,
      json: true,
      url: Utils.getKairosDbUrl()
    };
    request.post(requestOptions, function (error, response) {
      if (error) {
        Logger.error(error);
        if (callback) {
          return callback(error);
        }
      }
      Logger.debug('Metrics posted to kairos : ', metricArrayForKairos);
      if (response) {
        Logger.debug('Status Code : ', response.statusCode);
        if (callback) {
          return callback(response);
        }
      }

      if (callback) {
        return callback();
      }

    });
  }

};


function generateMetricKeys(routePath, paramsArray, projectName) {
  const metrics = [];
  let path = routePath.replace(/[{}}]\.*/g, '');
  path = Utils.getPathWithoutSessionId(path);
  const defaultMetric = 'midway';
  const defaultMetricPlusProject = defaultMetric + '.' + projectName;
  metrics.push(defaultMetric);
  metrics.push(defaultMetricPlusProject);

  // follow this pattern:  `midway.homepage.id.message.id2.20.30` should be `midway.homepage.id_message_id2.20_30`
  let array = [];
  if (path != '/') {
    array = _.split(path, '/').filter(function (text) {
      return text.length > 0;
    });
    const strUrl = array.join('_');
    const metricWithoutParam = defaultMetricPlusProject + '.' + strUrl;
    metrics.push(metricWithoutParam);

    if (paramsArray && paramsArray.length > 0) {
      const newParamsarray = [];
      paramsArray.forEach(function (element) {
        newParamsarray.push(Utils.getPathWithoutSessionId(element));
      });
      const strParam = newParamsarray.join('_');
      const metricWithParam = metricWithoutParam + '.' + strParam;
      metrics.push(metricWithParam);
    }

  }
  return metrics;
}