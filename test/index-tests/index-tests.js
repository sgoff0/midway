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
var midway = require('../../index');
var Constants = require('../../lib/constants');
require('../../resources/run-mock-server-api-dynamic.js');

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
      Expect(server.midwayOptions.port).to.equal(8080);
      Expect(server.midwayOptions.project).to.equal(Constants.DEFAULT);
      Expect(server.midwayOptions.host).to.equal('localhost');
      Expect(server.midwayOptions.mockedDirectory).to.equal(
        global.appRoot + '/' + Constants.MIDWAY_DEFAULT_MOCKED_DATA_LOC,
      );
      Expect(server.midwayOptions.httpsPort).to.equal(undefined);
      Expect(server.midwayOptions.collectMetrics).to.equal(true);
      Expect(server.midwayOptions.metricsDB).to.equal(undefined);
      Expect(typeof server.midwayOptions.respondWithFileHandler).to.equal(
        'function',
      );
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
        handler: function (req, h) {
          reply('test');
        },
      });

      var routeFound = false;
      for (var route in server.midwayOptions.userRoutes) {
        if (
          server.midwayOptions.userRoutes[route].routeData.id ===
          'testRouteAddServerRunning'
        ) {
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
      path: '/testRouteGetRoute',
    });

    Expect(midway.getRoute('testRouteGetRoute').id()).to.equal(
      'testRouteGetRoute',
    );
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
