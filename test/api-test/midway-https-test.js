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
var serverHttps = MidwayServer.getHttpsServer();
var Constants = require('../../lib/constants');
var Fs = require('fs');
var Path = require('path');

describe('Midway Server', function () {
  it('should start https if https port is provided', function (done) {
    serverHttps
      .get('/message')
      .end(function (err) {
        Expect(err).to.equal(null);
        done();
      });
  });
  it('should create folder .certs inside mocked directory  provided by the user', function (done) {
    Fs.stat(Path.join(MidwayServer.mockedDirectory, Constants.MIDWAY_CERT_FOLDER_NAME), function (err, stats) {
      Expect(stats.isDirectory()).to.be.true;
      done();
    });
  });
  it('should have key.pem inside .certs inside mocked directory  provided by the user', function (done) {
    Fs.exists(Path.join(MidwayServer.mockedDirectory, Constants.MIDWAY_CERT_FOLDER_NAME, 'key.pem'), function (exists) {
      Expect(exists).to.be.true;
      Fs.exists(Path.join(MidwayServer.mockedDirectory, Constants.MIDWAY_CERT_FOLDER_NAME, 'cert.pem'), function (exists) {
        Expect(exists).to.be.true;
        done();
      });
    });
  });
});
