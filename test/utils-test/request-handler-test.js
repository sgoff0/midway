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
var midway = require('../../lib/index');
var MidwayServer = require('../../resources/run-mock-server-api-dynamic.js');
var servers = MidwayServer.getServers();
var RequestHandler = require('../../lib/route-handlers/request-handler');
var sessionId;

servers.forEach(function (server) {
  describe('request-handler', function () {
    before(function (done) {
      sessionId = midway.registerSession();
      done();
    });

    after(function (done) {
      midway.closeSession(sessionId, function () {
        done();
      });
    });

    it('should prepend session id from query param', function (done) {
      var request = {
        url: {
          path: '/cart'
        },
        query: {
          midwaySessionId: '12345'
        },
        headers: {
          'x-request-page-params': JSON.stringify({
            midwaySessionId: '111111'
          })
        },
        setUrl: function (url) {
          setUrl = url;
        }
      };
      var reply = {
        continue: function () {
          Expect(setUrl).to.equal('/12345/cart');
          done();
        }
      };

      RequestHandler(request, reply);
    });

    it('should prepend session id from headers', function (done) {
      var request = {
        url: {
          path: '/cart'
        },
        headers: {
          'x-request-page-params': JSON.stringify({
            midwaySessionId: '12345'
          }),
          referer: 'http://localhost:8000/cart?midwaySessionId=111111'
        },
        setUrl: function (url) {
          setUrl = url;
        }
      };
      var reply = {
        continue: function () {
          Expect(setUrl).to.equal('/12345/cart');
          done();
        }
      };

      RequestHandler(request, reply);
    });

    it('should prepend session id from referer', function (done) {
      var request = {
        url: {
          path: '/cart'
        },
        headers: {
          referer: 'http://localhost:8000/cart?midwaySessionId=12345'
        },
        setUrl: function (url) {
          setUrl = url;
        }
      };
      var reply = {
        continue: function () {
          Expect(setUrl).to.equal('/12345/cart');
          done();
        }
      };
      RequestHandler(request, reply);
    });

    it('should not call setUrl if session id not found in request', function (done) {
      var request = {
        url: {
          path: '/cart'
        },
        setUrl: function () {
          Assert.fail('SetUrl should not be invoked when sessionId is not found');
        }
      };
      var reply = {
        continue: function () {
          done();
        }
      };
      RequestHandler(request, reply);
    });

    it('should not call setUrl if session id found in request but path is already prepended with session id', function (done) {
      var request = {
        url: {
          path: '12345/cart'
        },
        query: {
          midwaySessionId: '12345'
        },
        setUrl: function () {
          Assert.fail('SetUrl should not be invoked when session id found in request but path is already prepended with session id');
        }
      };
      var reply = {
        continue: function () {
          done();
        }
      };

      RequestHandler(request, reply);
    });


    it('should set mock variant with midway session id', function (done) {
      var url = '/helloSession?midwaySessionId=' + sessionId;
      midway.setMockVariant({
        fixture: 'helloSession',
        variant: 'sessionVariant',
        midwaySessionId: sessionId
      }, function (error, result) {
        Expect(result).to.have.property('fixture');
        server
          .get(url)
          .end(function (err, res) {
            Expect(err).to.equal(null);
            Expect(res).to.not.equal(null);
            Expect(res.body).to.not.equal(null);
            Expect(res.body.message).to.not.equal(null);
            Expect(res.body.message).to.equal('Hello session variant from Midway ' + sessionId);
            done();
          });
      });
    });
  });
});
