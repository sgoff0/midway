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
var FilePathController = require('../../lib/file-handler/file-handler-utils');
var index = require('../../index');  // eslint-disable-line no-unused-vars
var Expect = require('chai').expect;
var Constants = require('../../lib/constants');
var Path = require('path');

describe('File-Handler-Utils', function () {
  it('should throw an error when incorrect path is set in setPayload to retrieveFileDataBasedOnPayload ', function () {
    Expect(FilePathController.retrieveFileDataBasedOnPayload.bind(FilePathController, Path.join(Constants.MIDWAY_DEFAULT_MOCKED_DATA_LOC, 'message/default.json'))).to.throw(Error);
  });
  it('should return a JSON, txt or JS file selectFileFromDirectory ', function () {
    FilePathController.selectFileFromDirectory(Path.join(Constants.MIDWAY_DEFAULT_MOCKED_DATA_LOC, 'extension/GET'), 'dummy', function (result) {
      Expect(result).to.equal('resources/mocked-data/extension/GET/dummy.json');
    });
  });
  it('should return undefined when none of the extension of the files provided matches the valid extensions ', function () {
    FilePathController.selectFileFromDirectory(Path.join(Constants.MIDWAY_DEFAULT_MOCKED_DATA_LOC, 'extension/GET'), 'dummy_with_not_valid_extension', function (result) {
      Expect(result).to.equal(undefined);
    });
  });

});
