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
var Constants = require('../../lib/constants');
var servers = MidwayServer.getServers();

servers.forEach(function (Server) {
  describe('respond-file-extension-test - ' + Server.app, function () {

    afterEach(function (done) {
      MidwayServer.resetVariantToDefault(Server, '/file-extension', done);
    });

    it('should return json file type - Util Method', function (done) {
      Server
        .get('/extension')
        .expect('Content-type', /json/)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.body.fileType).to.equal('json');
          done();
        });
    });

    it('should return html file - Util Method', function (done) {
      // setMockVariant on the Server
      Server
        .post(Constants.MIDWAY_API_PATH + '/route/file-extension')
        .send({variant: 'HTML'})
        .expect(200)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);

          Server
            .get('/extension')
            .expect('Content-type', /html/)
            .end(function (err, res) {
              Expect(err).to.equal(null);
              Expect(res.text).to.equal('I am html');
              done();
            });
        });
    });

    it('should return txt file - Util Method', function (done) {
      // setMockVariant on the Server
      Server
        .post(Constants.MIDWAY_API_PATH + '/route/file-extension')
        .send({variant: 'TXT'})
        .expect(200)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);

          Server
            .get('/extension')
            .expect('Content-type', /text\/plain/)
            .end(function (err, res) {
              Expect(err).to.equal(null);
              Expect(res.text).to.equal('I am text');
              done();
            });
        });
    });

    it('should return unknown extension file - Util Method', function (done) {
      // setMockVariant on the Server
      Server
        .post(Constants.MIDWAY_API_PATH + '/route/file-extension')
        .send({variant: 'Unknown'})
        .expect(200)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);

          Server
            .get('/extension')
            .end(function (err, res) {
              Expect(err).to.equal(null);
              Expect(res.text).to.equal('I am unknown');
              done();
            });
        });
    });

    it('should return json file type - respondWithFile Method', function (done) {
      Server
        .post(Constants.MIDWAY_API_PATH + '/route/file-extension')
        .send({variant: 'json-respondWithFile'})
        .expect(200)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);

          Server
            .get('/extension')
            .expect('Content-type', /json/)
            .end(function (err, res) {
              Expect(err).to.equal(null);
              Expect(res.body.fileType).to.equal('json');
              done();
            });
        });
    });

    it('should return html file - respondWithFile Method', function (done) {
      // setMockVariant on the Server
      Server
        .post(Constants.MIDWAY_API_PATH + '/route/file-extension')
        .send({variant: 'HTML-respondWithFile'})
        .expect(200)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);

          Server
            .get('/extension')
            .expect('Content-type', /html/)
            .end(function (err, res) {
              Expect(err).to.equal(null);
              Expect(res.text).to.equal('I am html');
              done();
            });
        });
    });

    it('should return txt file - respondWithFile Method', function (done) {
      // setMockVariant on the Server
      Server
        .post(Constants.MIDWAY_API_PATH + '/route/file-extension')
        .send({variant: 'TXT-respondWithFile'})
        .expect(200)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);

          Server
            .get('/extension')
            .expect('Content-type', /text\/plain/)
            .end(function (err, res) {
              Expect(err).to.equal(null);
              Expect(res.text).to.equal('I am text');
              done();
            });
        });
    });

    it('should return content even if invalid syntax - respondWithFile Method', function (done) {
      // setMockVariant on the Server
      Server
        .post(Constants.MIDWAY_API_PATH + '/route/file-extension')
        .send({variant: 'invalid-syntax'})
        .expect(200)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);

          Server
            .get('/extension')
            .end(function (err) {
              try {
                Expect(err).to.equal(null);
              } catch (SyntaxError) {
                Expect(SyntaxError.message).to.contain('Unexpected token i');
                done();
              }
            });
        });
    });

    it('should return unknown extension file - respondWithFile Method', function (done) {
      // setMockVariant on the Server
      Server
        .post(Constants.MIDWAY_API_PATH + '/route/file-extension')
        .send({variant: 'Unknown-respondWithFile'})
        .expect(200)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Server
            .get('/extension')
            .end(function (err, res) {
              Expect(err).to.equal(null);
              Expect(res.text).to.equal('I am unknown');
              Expect(res.header[Constants.MOCKED_RESPONSE]).to.equal('true');
              done();
            });
        });
    });

  });
});
