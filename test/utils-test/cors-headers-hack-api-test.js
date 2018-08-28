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

var Expect = require('chai').expect;
var CorsHeadersHack = require('../../lib/utils/cors-headers-hack');

describe('cors-headers-hack', function () {

  it('Should store the headers as per method and request', function (done) {
    var data = getDataObject('/test1', 'POST', {'testHeader': 'header1'});
    CorsHeadersHack.setCorsHeaders(data);

    var getSetHeaders = CorsHeadersHack.getCorsHeaders('/test1', 'POST');
    Expect(getSetHeaders.testHeader).to.equal('header1');
    done();
  });

  it('Should store the headers for GET method if no method is defined', function (done) {
    var data = getDataObject('/test2', '', {'testHeader': 'header1'});
    CorsHeadersHack.setCorsHeaders(data);

    var getSetHeaders = CorsHeadersHack.getCorsHeaders('/test2', 'GET');
    Expect(getSetHeaders.testHeader).to.equal('header1');
    done();
  });

  it('Should store the headers for methods in uppercase irrespective of the case passed', function (done) {
    var data = getDataObject('/test3', 'get', {'testHeader': 'header1'});
    CorsHeadersHack.setCorsHeaders(data);

    var getSetHeaders = CorsHeadersHack.getCorsHeaders('/test3', 'GET');
    Expect(getSetHeaders.testHeader).to.equal('header1');
    done();
  });

  it('Should not store data if header is undefined', function (done) {
    var data = getDataObject('/test4', 'GET');
    CorsHeadersHack.setCorsHeaders(data);

    var getSetHeaders = CorsHeadersHack.getCorsHeaders('/test4', 'GET');
    Expect(getSetHeaders.testHeader).to.equal(undefined);
    done();
  });

  it('Should send value undefined if not present', function (done) {

    var getSetHeaders = CorsHeadersHack.getCorsHeaders('/test5', 'GET');
    Expect(getSetHeaders.testHeader).to.equal(undefined);

    done();
  });

  it('Should get the headers for methods in uppercase irrespective of the case passed', function (done) {
    var data = getDataObject('/test7', 'GET', {'testHeader': 'header1'});
    CorsHeadersHack.setCorsHeaders(data);

    var getSetHeaders = CorsHeadersHack.getCorsHeaders('/test7', 'get');
    Expect(getSetHeaders.testHeader).to.equal('header1');
    done();
  });

  it('Verify HAPI_CORS_OPTIONS array values', function (done) {

    Expect(CorsHeadersHack.HAPI_CORS_OPTIONS.length).to.equal(7);
    Expect(CorsHeadersHack.HAPI_CORS_OPTIONS.indexOf('origin')).to.not.equal(-1);
    Expect(CorsHeadersHack.HAPI_CORS_OPTIONS.indexOf('maxAge')).to.not.equal(-1);
    Expect(CorsHeadersHack.HAPI_CORS_OPTIONS.indexOf('headers')).to.not.equal(-1);
    Expect(CorsHeadersHack.HAPI_CORS_OPTIONS.indexOf('additionalHeaders')).to.not.equal(-1);
    Expect(CorsHeadersHack.HAPI_CORS_OPTIONS.indexOf('exposedHeaders')).to.not.equal(-1);
    Expect(CorsHeadersHack.HAPI_CORS_OPTIONS.indexOf('additionalExposedHeaders')).to.not.equal(-1);
    Expect(CorsHeadersHack.HAPI_CORS_OPTIONS.indexOf('credentials')).to.not.equal(-1);

    done();
  });

});


function getDataObject(path, method, headers) {
  var data = {};
  data.path = path;
  data.method = method;
  if (headers) {
    data.config = {};
    data.config.cors = headers;
  }
  return data;
}
