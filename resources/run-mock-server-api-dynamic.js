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
require('./endpoints');
var Supertest = require('supertest');
var Logger = require('testarmada-midway-logger');
var midway = require('../index');
var Constants = require('../lib/constants');
var Expect = require('chai').expect;
var httpPort = 3000;
var httpsPort = 4444;
var Async = require('async');
var servers = [
  Supertest.agent('http://localhost:3000'),
  Supertest.agent('https://localhost:4444')
];

var mockedDirectory = './resources/mocked-data';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

before(function (done) {
  Logger.info('Starting Midway Server for test cases');
  that.start({
    host: 'localhost',
    port: httpPort,
    httpsPort: httpsPort,
    mockedDirectory: mockedDirectory,
    metricsDB: 'http://kairos.server.com/api/v1/datapoints',
    sessions: 5,
    collectMetrics: true
  }, function (server) {
    that.setMidwayServer(server);
    done();
  });
});

after(function (done) {
  Logger.info('Stopping Midway Server for test cases');
  midway.resetURLCount();
  midway.resetMockId();
  midway.enableMetrics(false);

  // close all sessions
  var sessions = midway.getSessions();

  var closeSessionIterator = function (session, next) {
    midway.closeSession(session, function (err) {
      if (err) {
        Logger.debug(err);
      }
      next();
    });
  };

  var afterAsyncComplete = function () {
    that.stop();
    done();
  };

  Async.forEach(Object.keys(sessions), closeSessionIterator, afterAsyncComplete);
});

var that = module.exports = {

  mockedDirectory: mockedDirectory,

  start: function (options, callback) {
    midway.start(options, callback);
  },

  stop: function () {
    midway.stop();
  },

  getHttpServer: function () {
    return servers[0];
  },

  getHttpsServer: function () {
    return servers[1];
  },

  getServers: function () {
    return servers;
  },

  setMidwayServer: function (midwayServer) {
    this.MidwayServer = midwayServer;
  },

  getMidwayServer: function () {
    return this.MidwayServer;
  },

  connections: function (server) {
    return server.connections;
  },

  resetVariantToDefault: function (Server, endpoint, callback) {
    Server
      .post(Constants.MIDWAY_API_PATH + '/route' + endpoint)
      .send({variant: 'default'})
      .expect(200)
      .end(function (err, res) {
        Expect(err).to.equal(null);
        Expect(res.status).to.equal(200);
        callback();
      });
  },

  getHTTPPort: function () {
    return httpPort;
  },

  getHTTPSPort: function () {
    return httpsPort;
  }

};
