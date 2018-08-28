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
var MidwayServer = require('../../resources/run-mock-server-api-dynamic.js');
var Expect = require('chai').expect;
var Path = require('path');
var midway = require('../../index');
var relativePath = 'resources/mocked-data';
var absolutePath1 = Path.join(process.cwd(), 'resources/mocked-data');
var absolutePath2 = './resources/mocked-data';
var setMockId = false;
var servers = MidwayServer.getServers();

servers.forEach(function (server) {

  describe('path-retrieval-test - ' + server.app, function () {
    it('should work when path is relative', function (done) {
      setMockId = false;
      startServerAndVerifyResponse(server, relativePath, done);
    });

    it('should work when path is absolute - 1', function (done) {
      setMockId = false;
      startServerAndVerifyResponse(server, absolutePath1, done);
    });

    it('should work when path is absolute - 2', function (done) {
      setMockId = false;
      startServerAndVerifyResponse(server, absolutePath2, done);
    });

    it('should work when mockedDirectory path is not provided - should pick up default', function (done) {
      setMockId = false;
      startServerAndVerifyResponse(server, undefined, done);
    });

    it('should also handle absolute path-2 when setMockId is set', function (done) {
      setMockId = true;
      startServerAndVerifyResponse(server, absolutePath2, done);
    });
  });
});

function startServerAndVerifyResponse(server, mockedDirectory, done) {
  MidwayServer.start({
    mockedDirectory: mockedDirectory,
    port: 3000,
    httpsPort: 4444,
    collectMetrics: false
  }, function (midwayServer) {
    if (setMockId) {
      midway.setMockId('set-mock-id');
    }
    server
      .get('/message')
      .expect('Content-type', /json/)
      .expect(202)
      .end(function (err, res) {
        Expect(err).to.equal(null);
        Expect(res.status).to.equal(202);
        midway.resetMockId();
        midway.resetURLCount();
        midway.enableMetrics(false);
        MidwayServer.stop(midwayServer);
        done();
      });
  });
}
