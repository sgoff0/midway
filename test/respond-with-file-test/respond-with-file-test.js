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

servers.forEach(function (server) {

  describe('respond-with-file-test - ' + server.app, function () {
    it('should return json file using util function', function (done) {
      server
        .get('/message')
        .expect('Content-type', /json/)
        .expect(202)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(202);
          done();
        });
    });

    it('should return variant json file with code 302 using util function', function (done) {
      // setMockVariant on the server
      server
        .post(Constants.MIDWAY_API_PATH + '/route/message')
        .send({variant: 'variant'})
        .expect(200)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);

          server
            .get('/message')
            .expect('Content-type', /json/)
            .expect(302)
            .end(function (err, res) {
              Expect(err).to.equal(null);
              Expect(res.status).to.equal(302);
              Expect(res.body.collection.sectionOne.type).to.equal('variant');
              MidwayServer.resetVariantToDefault(server, '/message', done);
            });
        });
    });

    it('should return transposed json file with code 300 using util function', function (done) {
      // setMockVariant on the server
      server
        .post(Constants.MIDWAY_API_PATH + '/route/message')
        .send({variant: 'transpose'})
        .expect(200)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);

          server
            .get('/message')
            .expect('Content-type', /json/)
            .expect(300)
            .end(function (err, res) {
              Expect(err).to.equal(null);
              Expect(res.status).to.equal(300);
              Expect(res.body.collection.sectionOne.type).to.equal('Hello');
              Expect(res.body.collection.sectionOne.newData).to.equal('Universe');
              MidwayServer.resetVariantToDefault(server, '/message', done);
            });
        });
    });

    it('should return a global variant response', function (done) {
      // setMockVariant on the server
      server
        .post(Constants.MIDWAY_API_PATH + '/route/message')
        .send({variant: 'globalVariant'})
        .expect(200)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);

          server
            .get('/message')
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {
              Expect(err).to.equal(null);
              Expect(res.status).to.equal(200);
              Expect(res.body.global).to.equal('this is a global variant');
              MidwayServer.resetVariantToDefault(server, '/message', done);
            });
        });
    });

    it('should return another global variant response', function (done) {
      // setMockVariant on the server
      server
        .post(Constants.MIDWAY_API_PATH + '/route/message')
        .send({variant: 'anotherGlobalVariant'})
        .expect(200)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);

          server
            .get('/message')
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {
              Expect(err).to.equal(null);
              Expect(res.status).to.equal(200);
              Expect(res.body.global).to.equal('this is another global variant');
              MidwayServer.resetVariantToDefault(server, '/message', done);
            });
        });
    });

    it('should return json file with code 200(default) using direct function', function (done) {
      server
        .get('/product/grouping/api/collection/12345')
        .expect('Content-type', /json/)
        .expect(200)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.body.collection.sectionOne.type).to.equal('collection');
          done();
        });
    });

    it('should return json file with code 303 using direct function with variant', function (done) {
      server
        .post(Constants.MIDWAY_API_PATH + '/route/getCollection')
        .send({variant: 'discount'})
        .expect(200)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          server
            .get('/product/grouping/api/collection/12345')
            .expect('Content-type', /json/)
            .expect(200)
            .end(function (err, res) {
              Expect(err).to.equal(null);
              Expect(res.status).to.equal(200);
              Expect(res.body.collection.sectionOne.type).to.equal('discount');
              MidwayServer.resetVariantToDefault(server, '/getCollection', done);
            });
        });
    });

    it('should return 404', function (done) {
      // setMockVariant on the server
      server
        .post(Constants.MIDWAY_API_PATH + '/route/message')
        .send({variant: 'fileDoesNotExists2'})
        .expect(200)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          server
            .get('/message')
            .expect(404)
            .end(function (err, res) {
              Expect(err).to.equal(null);
              Expect(res.status).to.equal(404);
              MidwayServer.resetVariantToDefault(server, '/message', done);
            });
        });
    });

    it('should respond ok when route is defined as absolute path in filePath param passed in to route', function (done) {
      server
        .post(Constants.MIDWAY_API_PATH + '/route/message')
        .send({variant: 'variant with absolute path'})
        .expect(200)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          server
            .get('/message')
            .end(function (err, res) {
              Expect(err).to.equal(null);
              Expect(res.status).to.equal(200);
              MidwayServer.resetVariantToDefault(server, '/message', done);
            });
        });
    });

    it('should respond with delay when delay is provided - integration', function (done) {
      var t1 = new Date();
      server
        .post(Constants.MIDWAY_API_PATH + '/route/message')
        .send({variant: 'variant with delay'})
        .expect(200)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          server
            .get('/message')
            .expect(200)
            .end(function (err, res) {
              Expect(err).to.equal(null);
              Expect(res.status).to.equal(200);
              var t2 = new Date();
              Expect(t2 - t1).to.be.at.least(1000);
              MidwayServer.resetVariantToDefault(server, '/message', done);
            });
        });
    });

    it('should set the headers and cookies from the mocked file if setHeaders and setCookies are present in the mocked file for content type json', function (done) {
      server
        .post(Constants.MIDWAY_API_PATH + '/route/message')
        .send({variant: 'variant with setpayload as json'})
        .expect(200)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          server
            .get('/message')
            .expect(200)
            .end(function (err, res) {
              var cookies = res.headers['set-cookie'];
              Expect(err).to.equal(null);
              Expect(res.status).to.equal(200);
              Expect(res.headers['content-type']).to.equal('application/json; charset=utf-8');
              Expect(res.headers['x-powered-by']).to.equal('Express');
              Expect(res.headers['cf-ray']).to.equal('31b986c5b1b61edd-SJC');
              Expect(res.body.length).to.equal(100);
              Expect(cookies[0]).to.equal('__cfduid=d83ab9accd2584e2215d113d6df21c22b1483478759; expires=Wed, 03-Jan-18 21:25:59 GMT; path=/; domain=.typicode.com; HttpOnly');
              Expect(cookies[1]).to.equal('__smocks_state=static; Secure; HttpOnly; SameSite=Strict; Path=/');
              MidwayServer.resetVariantToDefault(server, '/message', done);
            });
        });
    });

    it('should set the headers and cookies from the mocked file if setHeaders and setCookies are present in the mocked file for content type non-json', function (done) {
      server
        .post(Constants.MIDWAY_API_PATH + '/route/message')
        .send({variant: 'variant with setpayload as file'})
        .expect(200)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          server
            .get('/message')
            .end(function (err, res) {
              var cookies = res.headers['set-cookie'];
              Expect(err).to.equal(null);
              Expect(res.status).to.equal(201);
              Expect(res.headers['content-type']).to.equal('text/plain; charset=utf-8');
              Expect(res.headers['x-powered-by']).to.equal('Express');
              Expect(res.headers['cf-ray']).to.equal('31cc1baee47b11fb-SJC');
              Expect(res.headers['cf-cache-status']).to.equal('HIT');
              Expect(JSON.parse(res.text).length).to.equal(100);
              Expect(cookies[0]).to.equal('__cfduid=d7502270409ade5544a5a60d0fbd7652a1483673602; expires=Sat, 06-Jan-18 03:33:22 GMT; path=/; domain=.typicode.com; HttpOnly');
              Expect(cookies[1]).to.equal('__smocks_state=static; Secure; HttpOnly; SameSite=Strict; Path=/');
              Expect(res.header[Constants.MOCKED_RESPONSE]).to.equal('true');
              MidwayServer.resetVariantToDefault(server, '/message', done);
            });
        });
    });

    it('should return from correct file when mock variant is set in default handler', function (done) {
      server
        .get('/respondWithVariantReplyFromFile')
        .expect('Content-type', /json/)
        .expect(200)
        .end(function (err, res) {
          Expect(err).to.equal(null);
          Expect(res.status).to.equal(200);
          Expect(res.body).to.not.be.null;
          Expect(res.body.variant).to.equal('variant1');
          done();
        });
    });

  });
});
