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
var KillProcess = require('./kill-process');
var Fs = require('fs');
var Logger = require('testarmada-midway-logger');
var SessionInfo = require('./../session-manager/session-info');
var MidwayUtil = require('testarmada-midway-util');
var Constants = require('../constants');
var Rp = require('request-promise');
var Promise = require('bluebird');
var FileHandler;
var sessionMockIds = {};
var sessionURLCallCount = {};
var serverStarted = false;
var serverProps = {};
var proxyService;
var kairosDbUrl;

module.exports = {

  initFileHandler: function (fileHandler) {
    FileHandler = fileHandler;
  },

  initProxyApi: function (proxyApi) {
    proxyService = proxyApi;
  },

  respondWithFile: function (route, reply, options) {
    if (!this.urlCalls) {
      this.urlCalls = {};
    }
    options = options || {};
    Logger.debug('Debug: The current Mock Id are: ', sessionMockIds);

    var handler = (route && route.route && route.route.mockedDirectory) ?
      require('../file-handler/file-handler')(route.route.mockedDirectory) : FileHandler;

    var routeVal;
    var variantVal;

    if (route._id && route._id !== Constants.DEFAULT) { // In case of respondWithMockVariant
      routeVal = route._route;
      variantVal = route._id;
    } else {
      routeVal = route.variant._route;
      variantVal = route.variant;
    }

    handler({
      options: options,
      reply: reply,
      route: routeVal,
      variant: variantVal
    });
  },

  respondWithMockVariant: function (route, variant, req, reply) {
    if (route && route.route && route.route._variants && route.route._variants[variant]) {
      return route.route._variants[variant].handler(req, reply);
    } else {
      if (reply) {
        reply('No such variant: ' + variant + ' defined');
      } else {
        return 'Reply object must be defined';
      }
    }
  },

  getSessionMockIds: function () {
    return sessionMockIds;
  },

  getSessionURLCallCount: function () {
    return sessionURLCallCount;
  },

  initializeSessionURLCallCount: function () {
    var sessions = SessionInfo.getSessions();
    for (var sessionId in sessions) {
      sessionURLCallCount[sessionId] = {};
    }
    sessionURLCallCount[Constants.DEFAULT_SESSION] = {};
  },

  isServerRunning: function () {
    return serverStarted;
  },

  setServerRunningStatus: function (status) {
    serverStarted = status;
  },

  killProcess: function (pid, signal, callback) {
    return KillProcess(pid, signal, callback);
  },

  // Should be discontinued later for transpose data
  // and when customers are migrated to transpose data
  substituteData: function (object, valueToSubstitute) {
    for (var key in object) {
      if (typeof (object[key]) === 'object') {
        this.substituteData(object[key], valueToSubstitute);
      } else {
        if (valueToSubstitute[key]) {
          object[key] = valueToSubstitute[key];
        }
      }
    }
    return object;
  },

  writeFile: function (fileLocation, fileData, callback) {
    Fs.writeFile(fileLocation, fileData, function (err) {
      if (err) {
        return callback(err);
      }
    });
  },

  deleteFile: function (filePath, callback) {
    Fs.unlink(filePath, function (err) {
      if (err) {
        return callback(err);
      }
    });
  },

  // this function is exposed as a api method to customers
  readJsonFile: function (fileLocation) {
    return MidwayUtil.readJsonFile(fileLocation);
  },

  transposeData: function (object, valueToSubstitute) {
    return MidwayUtil.transposeData(object, valueToSubstitute);
  },

  readDirectory: function (dirLocation, callback) {
    if (callback) {
      try {
        return Fs.readdir(dirLocation, callback);
      } catch (e) {
        return callback(e);
      }
    } else {
      var readDir = Promise.promisify(Fs.readdir);
      // We dont need to promisify each method separately once we use
      // promises for all fs functions
      return readDir(dirLocation);
    }
  },

  readAndFilterDirectory: function (dirLocation, fileName, callback) {
    this.readDirectory(dirLocation, function (error, files) {
      if (error) {
        if (error.code === 'ENOENT') {
          var errorMsg = 'Directory not found at: ' + dirLocation;
          Logger.error(errorMsg);
          return callback(errorMsg);
        } else {
          Logger.error(error);
          return callback(error);
        }
      }
      var filteredFile = files.filter(function (file) {
        Logger.debug('File to match: ' + file);
        var foundFiles = file.match(fileName);
        Logger.debug('foundFiles: ' + foundFiles);
        if (foundFiles && file.indexOf(foundFiles + '.') > -1) {
          Logger.debug('Selected file: ' + file);
          return true;
        } else {
          return false;
        }
      });
      Logger.debug('filteredFile: ' + filteredFile);
      return callback(null, filteredFile);

    });
  },

  readFile: function (fileLocation, callback) {
    if (callback) {
      return Fs.readFile(fileLocation, callback);
    } else {
      var readFileP = Promise.promisify(Fs.readFile);
      // We dont need to promisify each method separately once we use
      // promises for all fs functions
      return readFileP(fileLocation, 'utf-8');
    }
  },

  //TODO: If not used by customers, remove
  readFileSynchronously: function (fileLocation) {
    return MidwayUtil.readFileSynchronously(fileLocation);
  },

  /** Check if a directory exists
   * @param {string} dirLocation - Location of the directory
   * @returns {boolean} - true if the directory exists else returns false
   */
  checkDirectoryExists: function (dirLocation) {
    try {
      return Fs.statSync(dirLocation).isDirectory();
    } catch (e) {
      if (e.code == 'ENOENT') { // no such file or directory. File does not exist
        Logger.warn('Directory ' + dirLocation + ' does not exist.');
      } else {
        // something else went wrong, may be permissions, ...
        Logger.warn('Exception fs.statSync (' + dirLocation + '): ' + e);
      }
      return false;
    }
  },

  checkFileExists: function (fileLocation, callback) {
    Fs.exists(fileLocation, function (exists) {
      if (exists) {
        Logger.debug(fileLocation + ' exists!!');
      } else {
        Logger.warn(fileLocation + ' does not exists!!!');
      }
      return callback(exists);
    });
  },

  setMockId: function (mockId, sessionId) {
    sessionId = sessionId || Constants.DEFAULT_SESSION;
    sessionMockIds[sessionId] = mockId;
    Logger.debug('Setting Mock Id for [' + sessionId + '] session to: ' + mockId);

    // Update proxy api:s, if initialized
    if (proxyService) {
      proxyService.setMockId({mockId: mockId, sessionId: sessionId}, function (err) {
        if (err) {
          Logger.warn('Problem when updating proxy: ' + err);
        }
        Logger.debug('Mock Id for [' + sessionId + '] session set to: ' + mockId + ' in proxy api');
      });
    }
  },

  getMockId: function (sessionId) {
    var mockId = sessionMockIds.default;
    var session = Constants.DEFAULT_SESSION;
    if (sessionId !== undefined) {
      mockId = sessionMockIds[sessionId];
      session = sessionId;
    }
    Logger.debug('Current Mock Id for sessionId ' + session + ' is: ' + mockId);
    return mockId;
  },

  setMockVariant: function (options, callback) {

    if (!options.mockPort) {
      return callback(new Error('Missing mockPort in options'));
    }

    if (!options.variant) {
      return callback(new Error('Missing variant in options'));
    }

    if (!options.fixture) {
      return callback(new Error('Missing fixture in options'));
    }

      // SetMockVariant is a handy method to get a variant of a route which should be already defined in the endpoints.js
    var url = 'http://localhost:' + options.mockPort + Constants.MIDWAY_API_PATH + '/route/' + encodeURIComponent(options.fixture);
    if (options.midwaySessionId) {
      url += ('-' + options.midwaySessionId);
    }
    var payload = {
      variant: options.variant
    };
    var requestOptions = {
      method: 'POST',
      body: payload,
      json: true,
      url: url
    };

    Rp(requestOptions)
      .then(function () {
        Logger.debug('SetMockVariant POST Call is successful: ', requestOptions);
        if (callback) {
          return callback(null, options);
        }
      }, function (err) {
        Logger.error('SetMockVariant POST Call Not successful with options: ', requestOptions, err.message);
        if (callback) {
          return callback(err, 'failed');
        }
      }).catch(function (err) {
        if (callback) {
          return callback(err);
        }
      });
  },

  resetMockId: function (sessionId) {
    sessionId = sessionId || Constants.DEFAULT_SESSION;
    sessionMockIds[sessionId] = undefined;
    Logger.debug('Re-Setting Mock Id for [' + sessionId + '] session');

    // Update proxy api:s, if initialized
    if (proxyService) {
      proxyService.resetMockId({sessionId: sessionId}, function (err) {
        if (err) {
          Logger.warn('Problem when updating proxy: ' + err);
        }
        Logger.debug('Reset Mock Id for [' + sessionId + '] in proxy api');
      });
    }
  },

  resetURLCount: function (sessionId) {
    sessionId = sessionId || Constants.DEFAULT_SESSION;
    sessionURLCallCount[sessionId] = {};
    Logger.debug('Re-Setting URL count for [' + sessionId + '] session');
  },

  getURLCount: function (sessionId) {
    sessionId = sessionId || Constants.DEFAULT_SESSION;
    Logger.debug('Getting URL count for [' + sessionId + '] session: ' + sessionURLCallCount[sessionId]);
    return sessionURLCallCount[sessionId];
  },

  checkIfCertsExists: function (keyFile, certFile) {
    try {
      return Fs.statSync(keyFile).isFile() && Fs.statSync(certFile).isFile();
    } catch (e) {
      Logger.debug(e.message);
      return false;
    }

  },

  setServerProperties: function (options) {
    serverProps[Constants.HTTP_PORT] = options.port;
    serverProps[Constants.HTTPS_PORT] = options.httpsPort;
    serverProps[Constants.PROJECT] = options.project || Constants.DEFAULT;
  },

  setHttpPort: function (httpPort) {
    serverProps[Constants.HTTP_PORT] = httpPort;
  },

  getProjectName: function () {
    return serverProps[Constants.PROJECT];
  },

  getPortInfo: function () {
    var portInfo = {};
    portInfo[Constants.HTTP_PORT] = serverProps[Constants.HTTP_PORT] || Constants.NOT_AVAILABLE;
    portInfo[Constants.HTTPS_PORT] = serverProps[Constants.HTTPS_PORT] || Constants.NOT_AVAILABLE;
    return portInfo;
  },

  getPathWithoutSessionId: function (path) {
    // Check if path contains session id, if so remove it
    var sessions = SessionInfo.getSessions();
    for (var session in sessions) {
      var regex = new RegExp('^\\/' + session, 'i');
      path = path.toString().replace(regex, '');
    }
    return path;
  },

  getPathWithoutSessionIdFromData: function (data) {
    var path = this.getPath(data);
    return this.getPathWithoutSessionId(path);
  },

  getPath: function (data) {
    var path = data.route.path().replace(/[{}}]\.*/g, '');
    return path;
  },

  getSessionId: function (data) {
    var path = this.getPath(data);
    var sessions = SessionInfo.getSessions();
    for (var session in sessions) {
      var regex = new RegExp('^\\/' + session, 'i');
      if (regex.test(path)) {
        return session;
      }
    }

    return Constants.DEFAULT_SESSION;
  },

  setKairosDbUrl: function (url) {
    kairosDbUrl = url;
  },

  getKairosDbUrl: function () {
    return kairosDbUrl;
  }

};

