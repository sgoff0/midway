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
var sinon = require('sinon');
var Fs = require('fs');
var commonUtils = require('../../lib/utils/common-utils');

describe('file-utils-test', function () {

  var stub;
  var fileLocation = 'tmp.txt';
  var fileData = 'hello';
  var callback;

  afterEach(function () {
    stub.restore();
  });

  it('should write file successfully', function (done) {
    callback = function (err) {
      Expect(err).to.equal(null);
    };

    stub = sinon.stub(Fs, 'writeFile');
    stub.yields(null);

    commonUtils.writeFile(fileLocation, fileData, callback);
    done();
  });

  it('should return error when not able to write file successfully', function (done) {
    callback = function (err) {
      Expect(err).to.not.equal(null);
      Expect(err.message).to.equal('Not able to write file');
      done();
    };

    stub = sinon.stub(Fs, 'writeFile');
    stub.yields(new Error('Not able to write file'));

    commonUtils.writeFile(fileLocation, fileData, callback);
  });

  it('should unlink file successfully', function (done) {
    callback = function (err) {
      Expect(err).to.equal(null);
    };

    stub = sinon.stub(Fs, 'unlink');
    stub.yields(null);

    commonUtils.deleteFile(fileLocation, callback);
    done();
  });

  it('should return error when not able to unlink file successfully', function (done) {
    callback = function (err) {
      Expect(err).to.not.equal(null);
      Expect(err.message).to.equal('Not able to delete file');
      done();
    };

    stub = sinon.stub(Fs, 'unlink');
    stub.yields(new Error('Not able to delete file'));

    commonUtils.deleteFile(fileLocation, callback);

  });
});
