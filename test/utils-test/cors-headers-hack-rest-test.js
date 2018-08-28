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
var MidwayServer = require('../../resources/run-mock-server-api-dynamic.js');
var Expect = require('chai').expect;
var servers = MidwayServer.getServers();
var midway = require('../../lib/index');

servers.forEach(function (server) {
  describe('cors-headers-hack-rest-test: ' + server.app, function () {

    it('check cors heraders are set when run without a session id', function (done) {
      server
        .options('/hapi/cors/hack')
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.headers['access-control-allow-headers']).to.equal('Access-Control-Allow-Origin, Access-Control-Allow-Headers, Origin, X-Requested-With, Content-Type, WM_QOS.CORRELATION_ID');
          Expect(res.headers.testheader1).to.equal('test1');
          done();
        });
    });


    it('check cors heraders are set when run with session id', function (done) {
      var sessionId = midway.registerSession();
      server
        .options('/hapi/cors/hack?midwaySessionId=' + sessionId)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.headers['access-control-allow-headers']).to.equal('Access-Control-Allow-Origin, Access-Control-Allow-Headers, Origin, X-Requested-With, Content-Type, WM_QOS.CORRELATION_ID');
          Expect(res.headers.testheader1).to.equal('test1');
          midway.closeSession(sessionId, function () {
            done();
          });
        });
    });

    it('check cors heraders are set for dynamic URLS', function (done) {
      server
        .options('/hapi/cors/hack/1234')
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.headers['access-control-allow-headers']).to.equal('Access-Control-Allow-Origin, Access-Control-Allow-Headers, Origin, X-Requested-With, Content-Type, WM_QOS.CORRELATION_ID');
          Expect(res.headers.testheader1).to.equal('test1');
          done();
        });
    });

    it('check cors heraders are set for dynamic URLS and with session Id', function (done) {
      var sessionId = midway.registerSession();
      server
        .options('/hapi/cors/hack/1234?midwaySessionId=' + sessionId)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.headers['access-control-allow-headers']).to.equal('Access-Control-Allow-Origin, Access-Control-Allow-Headers, Origin, X-Requested-With, Content-Type, WM_QOS.CORRELATION_ID');
          Expect(res.headers.testheader1).to.equal('test1');
          midway.closeSession(sessionId, function () {
            done();
          });
        });
    });
  });
});
