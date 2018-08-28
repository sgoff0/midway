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
  describe('common-utils-rest-tests: ' + server.app, function () {

    it('Check respondwithmockvariant works when ID is same as path', function (done) {
      server
        .get('/respondWithVariant')
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.text).to.equal('I am an example of respond_with_mock_variant instead of response of main route');
          done();
        });
    });

    it('Check respondwithmockvariant works when ID is diff than path', function (done) {
      server
        .get('/respondWithVariantPathDiffFromId')
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.text).to.equal('respondWithVariantPathDiffFromId');
          done();
        });
    });

    it('Check respondwithmockvariant return right error if variant Id not defined', function (done) {
      server
        .get('/respondWithVariantError')
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.text).to.equal('No such variant: variant defined');
          done();
        });
    });

    it('Check respondwithmockvariant sets to default handler', function (done) {
      server
        .get('/respondWithVariant/1')
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.text).to.equal('I am an example of respond_with_mock_variant instead of response of main route - 1');
          done();
        });
    });
  });
});
