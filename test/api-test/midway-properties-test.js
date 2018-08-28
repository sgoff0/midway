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
var Path = require('path');
var Sinon = require('sinon');
var Fs = require('fs');

var MidwayServer = require('../../resources/run-mock-server-api-dynamic.js');
var midway = require('../../lib/index');
var Constants = require('../../lib/constants');
var Expect = require('chai').expect;

describe('midway', function () {

  it('should set project name when set from start function', function (done) {
    MidwayServer.start({collectMetrics: false, mockedDirectory: './resources/mocked-data'}, function (server) {
      Expect(midway.getProjectName()).to.be.equal('default');
      midway.resetMockId();
      midway.resetURLCount();
      midway.enableMetrics(undefined);
      MidwayServer.stop(server);
      done();
    });
  });

  it('should set project name to whatever value that is set from start function', function (done) {
    MidwayServer.start({collectMetrics: false, project: 'HomePage', mockedDirectory: './resources/mocked-data'}, function (server) {
      Expect(midway.getProjectName()).to.be.equal('HomePage');
      midway.resetMockId();
      midway.resetURLCount();
      midway.enableMetrics(undefined);
      MidwayServer.stop(server);
      done();
    });
  });

  it('should be able to get midway http port when started', function (done) {
    MidwayServer.start({collectMetrics: false, port: 3000, httpsPort: 4444}, function (server) {
      Expect(midway.getPortInfo().httpPort).to.be.equal(3000);
      Expect(midway.getPortInfo().httpsPort).to.be.equal(4444);
      midway.resetMockId();
      midway.resetURLCount();
      midway.enableMetrics(undefined);
      MidwayServer.stop(server);
      done();
    });
  });

  it('should be able to get n/a information when https port is not used', function (done) {
    MidwayServer.start({collectMetrics: false, port: 3000}, function (server) {
      Expect(midway.getPortInfo().httpPort).to.be.equal(3000);
      Expect(midway.getPortInfo().httpsPort).to.be.equal(Constants.NOT_AVAILABLE);
      midway.resetMockId();
      midway.resetURLCount();
      midway.enableMetrics(undefined);
      MidwayServer.stop(server);
      done();
    });
  });

  it('should get port 8080 if not used in options', function (done) {
    MidwayServer.start({collectMetrics: false}, function (server) {
      Expect(midway.getPortInfo().httpPort).to.be.equal(8080);
      Expect(midway.getPortInfo().httpsPort).to.be.equal(Constants.NOT_AVAILABLE);
      midway.resetMockId();
      midway.resetURLCount();
      midway.enableMetrics(undefined);
      MidwayServer.stop(server);
      done();
    });
  });

  it('should set default mocked directory to resources/mocked-data if not explicitly passed', function (done) {
    var statSyncStub = Sinon
      .stub(Fs, 'statSync')
      .returns({
        isDirectory: function () {
          return false;
        }
      });

    MidwayServer.start({collectMetrics: false}, function (server) {
      Expect(server.midwayOptions.mockedDirectory).to.be.equal(Path.join(process.cwd(), './resources/mocked-data'));
      Expect(server.midwayOptions.resolvedPath).to.be.equal(Path.join(process.cwd(), './resources/mocked-data'));
      midway.resetMockId();
      midway.resetURLCount();
      midway.enableMetrics(undefined);
      MidwayServer.stop(server);
      statSyncStub.restore();
      done();
    });
  });

  it('should enable metrics when metricsDB is set in options and collectMetrics is true', function (done) {
    MidwayServer.start({collectMetrics: true, metricsDB: 'http://kairos.server.com/api/v1/datapoints', mockedDirectory: './resources/mocked-data'}, function (server) {
      Expect(midway.isMetricsEnabled()).to.be.equal(true);
      midway.resetMockId();
      midway.resetURLCount();
      midway.enableMetrics(undefined);
      MidwayServer.stop(server);
      done();
    });
  });

  it('should enable metrics when metricsDB is set in options and collectMetrics is undefined', function (done) {
    MidwayServer.start({metricsDB: 'http://kairos.server.com/api/v1/datapoints', mockedDirectory: './resources/mocked-data'}, function (server) {
      Expect(midway.isMetricsEnabled()).to.be.equal(true);
      midway.resetMockId();
      midway.resetURLCount();
      midway.enableMetrics(undefined);
      MidwayServer.stop(server);
      done();
    });
  });

  it('should not enable metrics when metricsDB is not set in options and collectMetrics is true', function (done) {
    MidwayServer.start({collectMetrics: true, mockedDirectory: './resources/mocked-data'}, function (server) {
      Expect(midway.isMetricsEnabled()).to.be.equal(undefined);
      midway.resetMockId();
      midway.resetURLCount();
      midway.enableMetrics(undefined);
      MidwayServer.stop(server);
      done();
    });
  });

  it('should not enable metrics when metricsDB is not set in options and collectMetrics is undefined', function (done) {
    MidwayServer.start({mockedDirectory: './resources/mocked-data'}, function (server) {
      Expect(midway.isMetricsEnabled()).to.be.equal(undefined);
      midway.resetMockId();
      midway.resetURLCount();
      midway.enableMetrics(undefined);
      MidwayServer.stop(server);
      done();
    });
  });


});
