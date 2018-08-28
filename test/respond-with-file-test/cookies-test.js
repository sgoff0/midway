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
var servers = MidwayServer.getServers();

servers.forEach(function (server) {
  describe('cookie-test - ' + server.app, function () {

    it('check cookies are set', function (done) {
      server
      .get('/api/testCookies')
      .expect('Content-type', /json/)
      .end(function (err, res) {
        Expect(err).to.equal(null);
        Expect(res.status).to.equal(200);
        var cookies = res.headers['set-cookie'];
        Expect(cookies.length).to.equal(4);
        Expect(cookies[0]).to.equal('__smocks_state=static; Secure; HttpOnly; SameSite=Strict; Path=/');
        Expect(cookies[1]).to.equal('com.wm.customer=vz7.0b5c56; Secure; HttpOnly; SameSite=Strict');
        Expect(cookies[2]).to.equal('CID=SmockedCID; Secure; HttpOnly; SameSite=Strict; Domain=domain; Path=/');
        Expect(cookies[3]).to.equal('anotherCookie=cookieValue; Secure; HttpOnly; SameSite=Strict');
        done();
      });
    });

    it('check no cookies are set', function (done) {
      server
      .get('/api/testHeaders')
      .expect('Content-type', /json/)
      .end(function (err, res) {
        Expect(err).to.equal(null);
        Expect(res.status).to.equal(200);
        var cookies = res.headers['set-cookie'];
        Expect(cookies.length).to.equal(1);
        Expect(cookies[0]).to.equal('__smocks_state=static; Secure; HttpOnly; SameSite=Strict; Path=/');
        done();
      });
    });

  });
});
