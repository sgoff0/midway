import KillProcess from './kill-process';
import * as Fs from 'fs';
import * as Logger from 'testarmada-midway-logger';
import SessionInfo from './../session-manager/session-info';
import * as MidwayUtil from 'testarmada-midway-util';
import Constants from '../constants';
import ReadMockDataFromFile from '../file-handler/file-handler';
import * as Hapi from '@hapi/hapi';
const Rp = require('request-promise');
let FileHandler;
const sessionMockIds = {
  default: undefined
};
const sessionURLCallCount = {};
let serverStarted = false;
const serverProps = {};
let proxyService;
let kairosDbUrl;
import * as util from 'util';
import * as fs from 'fs';
import Route from '../smocks/route-model';
import { Midway } from '../index';
const readFile = util.promisify(fs.readFile);
const readDir = util.promisify(fs.readdir);
const exists = util.promisify(fs.exists);

interface HandlerOptions {
  code: number,
  headers: any,
}
async function makeNetworkCall(name: string, requestOptions, options) {
  // Rp(requestOptions).then(function () {
  //   Logger.debug(`${name} POST Call is successful: `, requestOptions);
  //   if (callback) {
  //     return callback(null, options);
  //   }
  // }, function (err) {
  //   Logger.error(`${name} POST Call Not successful with options: `, requestOptions, err.message);
  //   if (callback) {
  //     return callback(err, 'failed');
  //   }
  // }).catch(function (err) {
  //   if (callback) {
  //     return callback(err);
  //   }
  // });

  try {
    const response = await Rp(requestOptions);
    Logger.debug(`${name} POST Call is successful: `, requestOptions);
  } catch (err) {
    Logger.error(`${name} POST Call Not successful with options: `, requestOptions, err.message);
  }
}

class CommonUtils {

  public initFileHandler = (fileHandler) => {
    FileHandler = fileHandler;
  }

  public initProxyApi = (proxyApi) => {
    proxyService = proxyApi;
  }

  /**
   *  Called by user defined/charles generated routes in midway.utils.respondWithFile
   */
  public respondWithFile = async (route, h: Hapi.ResponseToolkit, options: HandlerOptions) => {
    // if (!this.urlCalls) {
    //   this.urlCalls = {};
    // }
    Logger.debug('Debug: The current Mock Id are: ', sessionMockIds);
    Logger.debug("Mocked directory: ", route.route?.mockedDirectory);

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

    const retVal = await handler({
      options: options,
      h: h,
      route: routeVal,
      variant: variantVal
    });
    return retVal;
  }

  public respondWithMockVariant = (route, variant, req, h: Hapi.ResponseToolkit) => {
    if (route && route.route && route.route._variants && route.route._variants[variant]) {
      return route.route._variants[variant].handler(req, h);
    } else {
      if (h) {
        return 'No such variant: ' + variant + ' defined';
      } else {
        return 'Reply object must be defined';
      }
    }
  }

  public getSessionMockIds = () => {
    return sessionMockIds;
  }

  public getSessionURLCallCount = () => {
    return sessionURLCallCount;
  }

  public initializeSessionURLCallCount = () => {
    const sessions = SessionInfo.getSessions();
    for (const sessionId in sessions) {
      sessionURLCallCount[sessionId] = {};
    }
    sessionURLCallCount[Constants.DEFAULT_SESSION] = {};
  }

  public isServerRunning = () => {
    return serverStarted;
  }

  public setServerRunningStatus = (status) => {
    serverStarted = status;
  }

  public killProcess = (pid, signal, callback) => {
    return KillProcess(pid, signal, callback);
  }

  // Should be discontinued later for transpose data
  // and when customers are migrated to transpose data
  public substituteData = (object, valueToSubstitute) => {
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
  }

  public writeFile = (fileLocation, fileData, callback) => {
    Fs.writeFile(fileLocation, fileData, function (err) {
      if (err) {
        return callback(err);
      }
    });
  }

  public deleteFile = (filePath, callback) => {
    Fs.unlink(filePath, function (err) {
      if (err) {
        return callback(err);
      }
    });
  }

  // this function is exposed as a api method to customers
  public readJsonFile = (fileLocation) => {
    return MidwayUtil.readJsonFile(fileLocation);
  }

  public transposeData = (object, valueToSubstitute) => {
    return MidwayUtil.transposeData(object, valueToSubstitute);
  }

  public readDirectory = async (dirLocation) => {
    return await readDir(dirLocation);
  }

  public readAndFilterDirectory = async (dirLocation, fileName) => {
    try {
      const files = await this.readDirectory(dirLocation);
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
      return filteredFile;
    } catch (error) {
      if (error.code === 'ENOENT') {
        const errorMsg = 'Directory not found at: ' + dirLocation;
        Logger.error(errorMsg);
        return errorMsg;
      } else {
        Logger.error(error);
        return error;
      }
    }
  }

  public readFile = async (fileLocation) => {
    return readFile(fileLocation, 'utf-8');
  }

  // //TODO: If not used by customers, remove
  // public readFileSynchronously = (fileLocation) => {
  //   return MidwayUtil.readFileSynchronously(fileLocation);
  // }

  /** Check if a directory exists
   * @param {string} dirLocation - Location of the directory
   * @returns {boolean} - true if the directory exists else returns false
   */
  public checkDirectoryExists = (dirLocation) => {
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
  }

  public checkFileExists = async (fileLocation) => {
    return exists(fileLocation);
  }

  public setMockId = (mockId, sessionId) => {
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
  }

  public getMockId = (sessionId) => {
    let mockId = sessionMockIds.default;
    let session = Constants.DEFAULT_SESSION;
    if (sessionId !== undefined) {
      mockId = sessionMockIds[sessionId];
      session = sessionId;
    }
    Logger.debug('Current Mock Id for sessionId ' + session + ' is: ' + mockId);
    return mockId;
  }

  public resetMockVariantWithSession = async (options) => {
    if (!options.hostName) {
      // return callback(new Error('Missing hostName in options'));
      throw new Error('Missing hostName in options');
    }
    if (options.midwaySessionId == undefined) {
      // return callback(new Error('Missing sessionID in options'));
      throw new Error('Missing sessionID in options');
    }
    const protocol = options.useHttp ? 'http' : 'https';
    const url = `${protocol}://${options.hostName}${Constants.MIDWAY_API_PATH}/sessionVariantState/reset/${options.midwaySessionId}`;
    const requestOptions = {
      method: 'POST',
      json: true,
      url: url
    };
    return await makeNetworkCall('ResetMockVariantWithSession', requestOptions, options);
  }

  public setMockVariantWithSession = async (options) => {
    if (!options.hostName) {
      // e.g. localhost:8000, or www.someMidayOnPCF.com
      // return callback(new Error('Missing hostName in options'));
      throw new Error('Missing hostName in options');
    }
    if (!options.fixtureToVariantMapping) {
      // e.g. { "GET /cardsvcs/acs/stmt/v1/statements": "withoutStatements" }
      // return callback(new Error('Missing fixture to variant mapping in options'));
      throw new Error('Missing fixture to variant mapping in options');
    }
    if (options.midwaySessionId == undefined) {
      // This util requires a session ID to be set, if running locally you can always use 0 or default to the same value
      // return callback(new Error('Missing sessionID in options'));
      throw new Error('Missing sessionID in options');
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
    return await makeNetworkCall('SetMockVariantWithSession', requestOptions, options);
  }

  // TODO sgoff0 finish refactoring
  public setMockVariant = async (options, callback) => {

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

    return await Rp(requestOptions).then(function () {
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
  }

  public resetMockId = (sessionId) => {
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
  }

  public resetURLCount = (sessionId) => {
    sessionId = sessionId || Constants.DEFAULT_SESSION;
    sessionURLCallCount[sessionId] = {};
    Logger.debug('Re-Setting URL count for [' + sessionId + '] session');
  }

  public getURLCount = (sessionId) => {
    sessionId = sessionId || Constants.DEFAULT_SESSION;
    Logger.debug('Getting URL count for [' + sessionId + '] session: ' + sessionURLCallCount[sessionId]);
    return sessionURLCallCount[sessionId];
  }

  public checkIfCertsExists = (keyFile, certFile) => {
    try {
      return Fs.statSync(keyFile).isFile() && Fs.statSync(certFile).isFile();
    } catch (e) {
      Logger.debug(e.message);
      return false;
    }

  }

  public setServerProperties = (options) => {
    serverProps[Constants.HTTP_PORT] = options.port;
    serverProps[Constants.HTTPS_PORT] = options.httpsPort;
    serverProps[Constants.PROJECT] = options.project || Constants.DEFAULT;
  }

  public setHttpPort = (httpPort) => {
    serverProps[Constants.HTTP_PORT] = httpPort;
  }

  public getProjectName = () => {
    return serverProps[Constants.PROJECT];
  }

  public getPortInfo = () => {
    const portInfo = {};
    portInfo[Constants.HTTP_PORT] = serverProps[Constants.HTTP_PORT] || Constants.NOT_AVAILABLE;
    portInfo[Constants.HTTPS_PORT] = serverProps[Constants.HTTPS_PORT] || Constants.NOT_AVAILABLE;
    return portInfo;
  }

  public getPathWithoutSessionId = (path) => {
    // Check if path contains session id, if so remove it
    const sessions = SessionInfo.getSessions();
    for (const session in sessions) {
      const regex = new RegExp('^\\/' + session, 'i');
      path = path.toString().replace(regex, '');
    }
    return path;
  }

  public getPathWithoutSessionIdFromData = (data) => {
    const path = this.getPath(data);
    return this.getPathWithoutSessionId(path);
  }

  public getPath = (data) => {
    const path = data.route.path().replace(/[{}}]\.*/g, '');
    return path;
  }
  public getSessionId = (data) => {
    const path = this.getPath(data);
    const sessions = SessionInfo.getSessions();
    for (const session in sessions) {
      const regex = new RegExp('^\\/' + session, 'i');
      if (regex.test(path)) {
        return session;
      }
    }
    return Constants.DEFAULT_SESSION;
  }

}

export default new CommonUtils();