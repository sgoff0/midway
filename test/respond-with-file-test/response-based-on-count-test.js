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
  describe('response-based-on-count-test', function () {
    before(function () {
      midway.setMockId('set-mock-id');
    });

    after(function () {
      midway.resetMockId('set-mock-id');
      midway.resetURLCount();
    });

    it('Instance 1: should return data from file 1', function (done) {
      server
      .get('/api/setMockId1')
      .expect('Content-type', /json/)
      .end(function (err, res) {
        Expect(err).to.equal(null);
        Expect(res.body.test).to.equal(1);
        done();
      });
    });

    it('Instance 2: should return data from file 2', function (done) {
      server
      .get('/api/setMockId1')
      .expect('Content-type', /json/)
      .end(function (err, res) {
        Expect(err).to.equal(null);
        Expect(res.body.test).to.equal(2);
        done();
      });
    });

    it('Instance 3: should return data from file 3', function (done) {
      server
      .get('/api/setMockId1')
      .expect('Content-type', /json/)
      .end(function (err, res) {
        Expect(err).to.equal(null);
        Expect(res.body.test).to.equal(3);
        done();
      });
    });

    it('Instance 4: should return data from default file as file four does not exists', function (done) {
      server
      .get('/api/setMockId1')
      .expect('Content-type', /json/)
      .end(function (err, res) {
        Expect(err).to.equal(null);
        Expect(res.body.test).to.equal('Default file');
        done();
      });
    });

    it('Instance 5: should return data from default file as file five does not exists', function (done) {
      server
      .get('/api/setMockId1')
      .expect('Content-type', /json/)
      .end(function (err, res) {
        Expect(err).to.equal(null);
        Expect(res.body.test).to.equal('Default file');
        done();
      });
    });

    it('Instance 6: should return data from file 6', function (done) {
      server
      .get('/api/setMockId1')
      .expect('Content-type', /json/)
      .end(function (err, res) {
        Expect(err).to.equal(null);
        Expect(res.body.test).to.equal(6);
        done();
      });
    });

  });
});
