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
var Path = require('path');
var MimeTypes = require('mime-types');
var Utils = require('./../utils/common-utils');
var Logger = require('testarmada-midway-logger');
var Includes = require('lodash.includes');
var Constants = require('./../constants');
var MidwayUtils = require('testarmada-midway-util');
var FileUtils = require('./file-handler-utils');
var FilePathHelper = require('./file-path-controller');

var fileExtensionOrder = ['.json', '.html', '.txt'];

/***
 *
 * Provides functionality for retrieving mock data from the filesystem.
 *
 */

module.exports = function (base) {
  return function (data) {
    var reply = data.reply;

    FilePathHelper.getFilePath(data, base, function (filePath) {
      Logger.debug('Filepath is : ' + filePath);
      var mimeType = MimeTypes.lookup(filePath);
      FileUtils.variables.mimeTypeOfResponse = mimeType;

      var fileExtension = Path.extname(filePath);
      Logger.debug('File extension is ' + fileExtension);

      if (Includes(fileExtensionOrder, fileExtension)) {
        var rawFileData;

        try {
          rawFileData = Fs.readFileSync(filePath, 'utf-8');
          var fileData = processFileData(rawFileData, mimeType, data);
          return prepareAndSendResponse(reply, fileData, data.options.code, data.options, FileUtils.variables.mimeTypeOfResponse);
        } catch (err) {
          return handleParsingErrorCases(err, reply, rawFileData, data, filePath);
        }
      } else {
        Logger.debug('Returning file as response:', filePath);
        return reply.file(filePath);
      }
    });
  };
};

function handleParsingErrorCases(err, reply, rawFileData, data, filePath) {
  Logger.warn(err.message);

  // Check if json syntax error
  if (err instanceof SyntaxError) {
    return handleJsonFileWithSyntaxError(reply, rawFileData, data, filePath);
  }

  // Update response code if file not found
  updateCodeIfFileNotFound(err, data, filePath);

  // Respond with the file content even if parsing error occurred
  if (data.options.code) {
    return prepareAndSendResponse(reply, undefined, data.options.code, data.options);
  } else {
    return prepareAndSendResponse(reply, err.message, Constants.NOT_FOUND, data.options);
  }
}

function handleJsonFileWithSyntaxError(reply, rawFileData, data, filePath) {
  Logger.warn('Invalid syntax in: ' + filePath + ' returning content to client anyway');
  return prepareAndSendResponse(reply, rawFileData, data.options.code, data.options, FileUtils.variables.mimeTypeOfResponse);
}

function updateCodeIfFileNotFound(err, data, filePath) {
  if (err.code === 'ENOENT') {
    err.message = 'File not found at: ' + filePath;
    data.options.code = data.options.code || Constants.NOT_FOUND;
  }
}

function processFileData(fileData, mimeType, data) {
  if (mimeType && Includes(mimeType, 'json')) {
    fileData = JSON.parse(fileData);
    //set headers and cookies from the mocked file, if present.
    FileUtils.collectMetaInformationFromfile(fileData, data.options);
    var setPayload = fileData[MidwayUtils.commonConstants.SET_PAYLOAD];
    if (setPayload) {
      fileData = FileUtils.retrieveFileDataBasedOnPayload(setPayload, data.options);
    }


    if (data.options.transpose !== undefined) {
      fileData = Utils.transposeData(fileData, data.options.transpose);
    }
  }
  return fileData;
}

function prepareAndSendResponse(reply, body, code, options, mimeType) {
  var response;
  var code = code || 200;
  if (mimeType) {
    // Response with specific mimeType
    response = reply(body).type(mimeType).code(code).hold();
  } else if (body) {
    // Response with no specific mimeType set
    response = reply(body).code(code).hold();
  } else {
    // Empty body response mostly 404
    response = reply().code(code).hold();
  }
  var res = FileUtils.setHeadersAndCookies(response, options);
  return sendResponse(res, options.delay);
}

function sendResponse(response, delay) {
  setTimeout(function () {
    response.send();
  }, delay);
}
