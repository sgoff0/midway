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
var midway = require('../../lib/index');
var servers = MidwayServer.getServers();

servers.forEach(function (server) {
  describe('set-mock-id-test - ' + server.app, function () {

    before(function () {
      midway.setMockId('set-mock-id');
    });

    after(function () {
      midway.resetMockId();
      midway.resetURLCount();
    });

    it('data should be returned from the folder "set-mock-id" for api setMockId1', function (done) {
      server
      .get('/api/setMockId1')
      .expect('Content-type', /json/)
      .end(function (err, res) {
        Expect(err).to.equal(null);
        Expect(res.body.test).to.equal(1);
        Expect(res.status).to.equal(201);
        done();
      });
    });

    it('data should be returned from the folder "set-mock-id" for api setMockId', function (done) {
      server
      .get('/api/setMockId')
      .end(function (err, res) {
        Expect(err).to.equal(null);
        Expect(res.text).to.equal('I am txt and should be returned for first call only.');
        done();
      });
    });

    it('data should be returned for url with dashes', function (done) {
      server
      .get('/api/checkout-customer/1234/shipping-address')
      .end(function (err, res) {
        Expect(err).to.equal(null);
        Expect(res.body.test).to.equal('url with  Dash response file');
        done();
      });
    });
  });
});
