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
var Path = require('path');
var Utils = require('./../utils/common-utils');
var Logger = require('testarmada-midway-logger');
var SessionInfo = require('./../session-manager/session-info');
var MidwayUtils = require('testarmada-midway-util');
var Fs = require('fs');
var IsValidPath = require('is-valid-path');

var fileExtensionOrder = ['.json', '.html', '.txt'];

var internals = {};
internals.variables = {};

/**
 *
 * Util functions for file-handler related classes.
 *
 */

internals.collectMetaInformationFromfile = function (fileData, options) {
  var headersFromFile = fileData[MidwayUtils.commonConstants.SET_HEADER];
  var cookiesFromFile = fileData[MidwayUtils.commonConstants.SET_COOKIE];
  var codeFromFile = fileData[MidwayUtils.commonConstants.SET_CODE];
  var contentTypeFromFile = fileData[MidwayUtils.commonConstants.SET_CONTENT_TYPE];

  if (headersFromFile) {
    // this is deleted because setContentType in the recorded file should be treated as source of truth.
    delete headersFromFile['content-type'];
    options.headers = headersFromFile;
  }
  if (cookiesFromFile) {
    options.cookies = cookiesFromFile;
  }
  if (codeFromFile) {
    options.code = codeFromFile;
  }
  if (contentTypeFromFile) {
    options.contentType = contentTypeFromFile;
  }

  return options;

};

internals.setCurrentMimeType = function (mimeType) {
  internals.variables.mimeTypeOfRespose = mimeType;
};

internals.setHeadersAndCookies = function (response, options) {
  var responseHeaders = this.setHeaders(response, options.headers);
  var responseCookies = this.setCookies(responseHeaders, options.cookies);
  return responseCookies;
};

internals.setHeaders = function (response, headers) {
  if (headers !== undefined) {
    for (var key in headers) {
      Logger.debug('Setting header: ' + key + ' to: ' + headers[key]);
      response = response.header(key, headers[key]);
    }
  }
  return response;
};

internals.setCookies = function (response, cookies) {
  if (cookies !== undefined) {
    cookies.forEach(function (cookie) {
      Logger.debug('Setting Cookie: ' + cookie.name + ' to: ' + cookie.value);
      if (cookie.options !== undefined) {
        response = response.state(cookie.name, cookie.value, cookie.options);
      } else {
        response = response.state(cookie.name, cookie.value);
      }
    });
  }
  return response;
};


internals.getPathWithoutSessionId = function (data) {
  var path = Utils.getPath(data);

  // Check if path contains session id, if so remove it to get to the right file
  var sessions = SessionInfo.getSessions();
  for (var session in sessions) {
    var regex = new RegExp('^\\/' + session, 'i');
    path = path.replace(regex, '');
  }

  return path;
};

internals.getRouteMethod = function (data) {
  return data.route.method();
};

internals.getCodeFromFilePath = function (filePath) {
  var code = filePath.split('.');
  code = code[0].split('-');
  return parseInt(code[code.length - 1]);
};

internals.handleCodeFile = function (fileType, filePath, data) {
  Logger.info('Found ' + fileType + ' file with code and returning that as response: ' + filePath);
  data.options.code = internals.getCodeFromFilePath(filePath);
  Logger.debug('code: ' + data.options.code);
};

internals.retrieveFileDataBasedOnPayload = function (payload, options) {
  var appDir = global.appRoot;
  if (IsValidPath(payload)) {
    if (Fs.existsSync(Path.join(appDir, payload))) {
      internals.variables.mimeTypeOfResponse = options.contentType || MimeTypes.lookup(payload) || mimeType;
      fileData = Fs.readFileSync(payload);  //when handling non JSON content, read the file that is set as value of setPayload
    } else {
      Logger.error('File ' + payload + ' does not exist');
      throw new Error('File ' + payload + ' does not exist');
    }
  } else {  // assuming that setPayload is of type JSON
    internals.variables.mimeTypeOfResponse = options.contentType || 'application/json';
    fileData = payload;
  }
  return fileData;
};

internals.selectFileFromDirectory = function (directory, fileName, callback) {
  Utils.readAndFilterDirectory(directory, fileName, function (error, files) {
    if (error) {
      return callback(error);
    }
    // This is done to remove regex from file name for code specific files
    var filePath;
    Logger.debug('files found: ' + files);
    if (files.length === 0) {
      if (fileName instanceof RegExp) {
        fileName = 'DummyFileName';
      }

      filePath = Path.join(directory, fileName);
      Logger.warn('No response files found at: ' + filePath);
      Logger.debug('Setting default extension to .json and file not exists will be handled later');
      filePath += '.json';
    } else if (files.length === 1) {
      filePath = Path.join(directory, files[0]);
    } else {
      for (var index in fileExtensionOrder) {
        if (files.indexOf(fileName + fileExtensionOrder[index]) > -1) {
          filePath = Path.join(directory, fileName + fileExtensionOrder[index]);
          break;
        }
      }
    }
    callback(filePath);
  });
};

internals.getNextValue = function (data, defaultFileName) {
  // Pick file based on the number of times the URL is called
  // for ex: If URL is called for second time than pick urlPath-2.json.
  // If urlPath-2.json is not present than return urlPath.json
  var urlCalls = Utils.getSessionURLCallCount();
  var sessionId = Utils.getSessionId(data);
  var curSessionURLCallCount = urlCalls[sessionId];
  Logger.debug('Url Call Count for [' + sessionId + '] session is: ' + JSON.stringify(curSessionURLCallCount));
  var nextValue = 1;
  if (curSessionURLCallCount[defaultFileName] !== undefined) {
    var curVal = curSessionURLCallCount[defaultFileName];
    nextValue = curVal + 1;
  }
  curSessionURLCallCount[defaultFileName] = nextValue;
  Logger.debug(internals.getPathWithoutSessionId(data) + ' for [' + sessionId + '] session is called for the count: ' + nextValue);
  Logger.debug('Url Call Count NOW for [' + sessionId + '] session is: ' + JSON.stringify(curSessionURLCallCount));
  return nextValue;
};

module.exports = internals;
