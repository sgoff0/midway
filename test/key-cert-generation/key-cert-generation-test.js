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
var Fs = require('fs');
var chai = require('chai');
var Expect = chai.expect;
var GenerateCertificateManager = require('../../lib/utils/generate-certificate-manager');
var midway = require('../../lib/');
var Constants = require('../../lib/constants');
var rimraf = require('rimraf');
var Path = require('path');
var sinon = require('sinon');
var Pem = require('pem');

describe('key-generation', function () {
  beforeEach(function (done) {
    rimraf(Path.join(Constants.MIDWAY_DEFAULT_MOCKED_DATA_LOC, Constants.MIDWAY_CERT_FOLDER_NAME), function () {
      done();
    });
  });

  afterEach(function (done) {
    rimraf(Path.join(Constants.MIDWAY_DEFAULT_MOCKED_DATA_LOC, Constants.MIDWAY_CERT_FOLDER_NAME), function () {
      done();
    });
  });

  it('should be able to create private key and certificate if the files are not present', function (done) {
    GenerateCertificateManager.genCerts(Constants.MIDWAY_DEFAULT_MOCKED_DATA_LOC, function (err, result) {
      Expect(result).to.be.an('object').to.have.deep.property('key');
      Expect(result).to.be.an('object').to.have.deep.property('cert');
      done();
    });
  });

  it('should create a folder to generate certs when its not present', function (done) {
    midway.start({
      mockedDirectory: Constants.MIDWAY_DEFAULT_MOCKED_DATA_LOC,
      httpsPort: 4444
    }, function (server) {
      Fs.exists(Path.join(Constants.MIDWAY_DEFAULT_MOCKED_DATA_LOC, Constants.MIDWAY_CERT_FOLDER_NAME), function (result) {
        Expect(result).to.be.true;
        midway.stop(server, function () {
          done();
        });
      });

    });
  });

  it('should throw error if cannot write certs', function (done) {
    var Sandbox = sinon.sandbox.create();
    var fileWriteStub = Sandbox.stub(Fs, 'writeFile');
    fileWriteStub.yields(new Error('error in writing file'));

    GenerateCertificateManager.genCerts(Constants.MIDWAY_DEFAULT_MOCKED_DATA_LOC, function (err, result) {
      Expect(err).to.not.be.undefined;
      Expect(result).to.be.undefined;
      Expect(err.message).to.equal('error in writing file');
      Sandbox.restore();
      done();
    });
  });

  it('should catch the error appropriately from Pem certificate generation', function (done) {
    var Sandbox = sinon.sandbox.create();
    var pemStub = Sandbox.stub(Pem, 'createCertificate');
    var fakeError = new Error('fakeerror');
    pemStub.yields(fakeError);

    GenerateCertificateManager.genCerts(Constants.MIDWAY_DEFAULT_MOCKED_DATA_LOC, function (err) {
      Expect(err.message).to.equal('fakeerror');
      Sandbox.restore();
      done();
    });
  });

});
