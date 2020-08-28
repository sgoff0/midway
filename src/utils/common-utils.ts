import KillProcess from './kill-process';
import * as Fs from 'fs';
import * as Logger from 'testarmada-midway-logger';
import SessionInfo from './../session-manager/session-info';
import * as MidwayUtil from 'testarmada-midway-util';
import Constants from '../constants';
import ReadMockDataFromFile from '../file-handler/file-handler';
import * as Hapi from '@hapi/hapi';
const Rp = require('request-promise');
const Promise = require('bluebird');
let FileHandler;
const sessionMockIds = {
  default: undefined
};
const sessionURLCallCount = {};
let serverStarted = false;
const serverProps = {};
let proxyService;
let kairosDbUrl;

function makeNetworkCall(name: string, requestOptions, options, callback) {
  Rp(requestOptions).then(function () {
    Logger.debug(`${name} POST Call is successful: `, requestOptions);
    if (callback) {
      return callback(null, options);
    }
  }, function (err) {
    Logger.error(`${name} POST Call Not successful with options: `, requestOptions, err.message);
    if (callback) {
      return callback(err, 'failed');
    }
  }).catch(function (err) {
    if (callback) {
      return callback(err);
    }
  });
}
export default {

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

    const handler = (route && route.route && route.route.mockedDirectory) ? ReadMockDataFromFile(route.route.mockedDirectory) : FileHandler;

    let routeVal;
    let variantVal;

    if (route._id && route._id !== Constants.DEFAULT) {// In case of respondWithMockVariant
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

  respondWithMockVariant: function (route, variant, req, h: Hapi.ResponseToolkit) {
    if (route && route.route && route.route._variants && route.route._variants[variant]) {
      return route.route._variants[variant].handler(req, h);
    } else {
      if (h) {
        return 'No such variant: ' + variant + ' defined';
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
    const sessions = SessionInfo.getSessions();
    for (const sessionId in sessions) {
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
    for (const key in object) {
      if (typeof object[key] === 'object') {
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
      const readDir = Promise.promisify(Fs.readdir);
      // We dont need to promisify each method separately once we use
      // promises for all fs functions
      return readDir(dirLocation);
    }
  },

  readAndFilterDirectory: function (dirLocation, fileName, callback) {
    this.readDirectory(dirLocation, function (error, files) {
      if (error) {
        if (error.code === 'ENOENT') {
          const errorMsg = 'Directory not found at: ' + dirLocation;
          Logger.error(errorMsg);
          return callback(errorMsg);
        } else {
          Logger.error(error);
          return callback(error);
        }
      }
      const filteredFile = files.filter(function (file) {
        Logger.debug('File to match: ' + file);
        const foundFiles = file.match(fileName);
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
      const readFileP = Promise.promisify(Fs.readFile);
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
      if (e.code == 'ENOENT') {// no such file or directory. File does not exist
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
      proxyService.setMockId({ mockId: mockId, sessionId: sessionId }, function (err) {
        if (err) {
          Logger.warn('Problem when updating proxy: ' + err);
        }
        Logger.debug('Mock Id for [' + sessionId + '] session set to: ' + mockId + ' in proxy api');
      });
    }
  },

  getMockId: function (sessionId) {
    let mockId = sessionMockIds.default;
    let session = Constants.DEFAULT_SESSION;
    if (sessionId !== undefined) {
      mockId = sessionMockIds[sessionId];
      session = sessionId;
    }
    Logger.debug('Current Mock Id for sessionId ' + session + ' is: ' + mockId);
    return mockId;
  },

  resetMockVariantWithSession: function (options, callback) {
    if (!options.hostName) {
      return callback(new Error('Missing hostName in options'));
    }
    if (options.midwaySessionId == undefined) {
      return callback(new Error('Missing sessionID in options'));
    }
    const protocol = options.useHttp ? 'http' : 'https';
    const url = `${protocol}://${options.hostName}${Constants.MIDWAY_API_PATH}/sessionVariantState/reset/${options.midwaySessionId}`;
    const requestOptions = {
      method: 'POST',
      json: true,
      url: url
    };
    makeNetworkCall('ResetMockVariantWithSession', requestOptions, options, callback);
  },

  setMockVariantWithSession: function (options, callback) {
    if (!options.hostName) {
      // e.g. localhost:8000, or www.someMidayOnPCF.com
      return callback(new Error('Missing hostName in options'));
    }
    if (!options.fixtureToVariantMapping) {
      // e.g. { "GET /cardsvcs/acs/stmt/v1/statements": "withoutStatements" }
      return callback(new Error('Missing fixture to variant mapping in options'));
    }
    if (options.midwaySessionId == undefined) {
      // This util requires a session ID to be set, if running locally you can always use 0 or default to the same value
      return callback(new Error('Missing sessionID in options'));
    }
    const protocol = options.useHttp ? 'http' : 'https';

    const url = `${protocol}://${options.hostName}${Constants.MIDWAY_API_PATH}/sessionVariantState/set/${options.midwaySessionId}`;
    const payload = options.fixtureToVariantMapping;
    const requestOptions = {
      method: 'POST',
      body: payload,
      json: true,
      url: url
    };
    makeNetworkCall('SetMockVariantWithSession', requestOptions, options, callback);
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
    let url = 'http://localhost:' + options.mockPort + Constants.MIDWAY_API_PATH + '/route/' + encodeURIComponent(options.fixture);
    if (options.midwaySessionId) {
      url += '-' + options.midwaySessionId;
    }
    const payload = {
      variant: options.variant
    };
    const requestOptions = {
      method: 'POST',
      body: payload,
      json: true,
      url: url
    };

    Rp(requestOptions).then(function () {
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
      proxyService.resetMockId({ sessionId: sessionId }, function (err) {
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
    const portInfo = {};
    portInfo[Constants.HTTP_PORT] = serverProps[Constants.HTTP_PORT] || Constants.NOT_AVAILABLE;
    portInfo[Constants.HTTPS_PORT] = serverProps[Constants.HTTPS_PORT] || Constants.NOT_AVAILABLE;
    return portInfo;
  },

  getPathWithoutSessionId: function (path) {
    // Check if path contains session id, if so remove it
    const sessions = SessionInfo.getSessions();
    for (const session in sessions) {
      const regex = new RegExp('^\\/' + session, 'i');
      path = path.toString().replace(regex, '');
    }
    return path;
  },

  getPathWithoutSessionIdFromData: function (data) {
    const path = this.getPath(data);
    return this.getPathWithoutSessionId(path);
  },

  getPath: function (data) {
    const path = data.route.path().replace(/[{}}]\.*/g, '');
    return path;
  },

  getSessionId: function (data) {
    const path = this.getPath(data);
    const sessions = SessionInfo.getSessions();
    for (const session in sessions) {
      const regex = new RegExp('^\\/' + session, 'i');
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