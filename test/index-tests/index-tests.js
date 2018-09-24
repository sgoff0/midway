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

var Expect = require('chai').expect;
var MidwayServer = require('../../resources/run-mock-server-api-dynamic.js');
var midway = require('../../index');
var Constants = require('../../lib/constants');
var Servers = MidwayServer.getServers();

describe('index-tests', function () {

  it('Verify if no ID is passed, Midway server returns undefined', function (done) {
    var id = midway.id();
    Expect(id).to.equal('example');
    done();
  });

  it('Verify if ID is passed, Midway server returns that ID', function (done) {
    var midwayServerObject = midway.id('test');
    Expect(midwayServerObject).to.equal('example');
    done();
  });

  it('Verify Midway is started on default parameters if options is undefined', function (done) {
    midway.start(undefined, function (server) {
      // console.log(server);
      Expect(server.midwayOptions.port).to.equal(8080);
      Expect(server.midwayOptions.project).to.equal(Constants.DEFAULT);
      Expect(server.midwayOptions.host).to.equal('localhost');
      Expect(server.midwayOptions.mockedDirectory).to.equal(global.appRoot + '/' + Constants.MIDWAY_DEFAULT_MOCKED_DATA_LOC);
      Expect(server.midwayOptions.httpsPort).to.equal(undefined);
      Expect(server.midwayOptions.proxyPort).to.equal(undefined);
      Expect(server.midwayOptions.proxyHost).to.equal('localhost');
      Expect(server.midwayOptions.collectMetrics).to.equal(true);
      Expect(server.midwayOptions.metricsDB).to.equal(undefined);
      Expect(typeof server.midwayOptions.respondWithFileHandler).to.equal('function');
      midway.enableMetrics(false);
      midway.stop(server, function () {
        done();
      });
    });
  });

  it('Verify no error if Midway is started without callback', function (done) {
    try {
      midway.start(undefined, undefined);
    } catch (err) {
      Expect.fail();
    }
    done();
  });

  it('Verify routes cannot be added if server is running', function (done) {
    midway.start(undefined, function (server) {
      midway.route({
        id: 'testRouteAddServerRunning',
        label: 'Add State',
        path: '/routeAdd',
        handler: function (req, reply) {
          reply('test');
        }
      });

      var routeFound = false;
      for (var route in server.midwayOptions.userRoutes) {
        if (server.midwayOptions.userRoutes[route].routeData.id === 'testRouteAddServerRunning') {
          routeFound = true;
        }
      }
      Expect(routeFound).to.equal(false);
      midway.enableMetrics(false);
      midway.stop(server, function () {
        done();
      });
    });
  });

  it('Verify getRoute returns routes', function () {
    midway.route({
      id: 'testRouteGetRoute',
      label: 'Testing getRoute',
      path: '/testRouteGetRoute'
    });

    Expect(midway.getRoute('testRouteGetRoute').id()).to.equal('testRouteGetRoute');
    Expect(midway.getRoute('testRouteBadGetRoute')).to.equal(undefined);
  });
});

it('Verify no error for toPlugin method if options are undefined', function (done) {
  try {
    var plugin = midway.toPlugin({}, undefined);
    Expect(plugin.attributes.sessions).to.equal(0);
  } catch (err) {
    Expect.fail();
  }
  done();
});

it('Verify all variants are reset for a session id', function (done) {
  var sessionId = midway.registerSession();

  var setVariantOptions = {};
  var url = '/closeSessionTest?midwaySessionId=' + sessionId;
  setVariantOptions[Constants.VARIANT] = 'variant';
  setVariantOptions[Constants.FIXTURE] = 'closeSessions-' + sessionId;

  midway.setMockVariant(setVariantOptions, function () {
    Servers[0]
      .get(url)
      .expect(200)
      .end(function (err, res) {
        Expect(res.text).to.equal('not_default');

        midway.resetAllVariants(sessionId, function () {
          Servers[0]
          .get(url)
          .expect(200)
          .end(function (err, res) {
            Expect(res.text).to.equal('default');
            midway.closeSession(sessionId, function () {
              Expect(midway.checkSession(sessionId)).to.equal('AVAILABLE');
              Servers[0]
                .get(url)
                .expect(200)
                .end(function (err, res) {
                  Expect(res.text).to.equal('default');
                  done();
                });
            });
          });
        });
      });
  });
});

it('Verify all variants are reset for default session', function (done) {
  var setVariantOptions = {};
  var url = '/closeSessionTest';
  setVariantOptions[Constants.VARIANT] = 'variant';
  setVariantOptions[Constants.FIXTURE] = 'closeSessions';

  midway.setMockVariant(setVariantOptions, function () {
    Servers[0]
      .get(url)
      .expect(200)
      .end(function (err, res) {
        Expect(res.text).to.equal('not_default');
        midway.resetAllVariants(function () {
          Servers[0]
          .get(url)
          .expect(200)
          .end(function (err, res) {
            Expect(res.text).to.equal('default');
            done();
          });
        });
      });
  });
});


it('Verify error is thrown from resetAllVariants - callback is not a function', function (done) {
  try {
    midway.resetAllVariants('abc', 'def');
  } catch (e) {
    Expect(e.message).to.equal('Callback to resetAllVariants shoud be a function');
    done();
  }
  Expect.fail('Should have thrown error if callback is not a valid function to resetAllVariants');
});
