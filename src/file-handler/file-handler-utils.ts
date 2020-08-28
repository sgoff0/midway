import { appRoot } from '../utils/pathHelpers';

import * as _ from 'lodash';
import * as Path from 'path';
import * as MimeTypes from 'mime-types';
import Utils from './../utils/common-utils';
import * as Logger from 'testarmada-midway-logger';
import SessionInfo from './../session-manager/session-info';
const MidwayUtils = require('testarmada-midway-util');
import * as Fs from 'fs';
import { FileHandlerInput, FileHandlerOptions } from './file-handler';
const IsValidPath = require('is-valid-path');

const fileExtensionOrder = ['.json', '.html', '.txt'];

const headersToIgnore = ['Transfer-Encoding'];
const ignoreRegex = new RegExp(headersToIgnore.join("|"), "i");

class FileHandlerUtils {
  public variables = {
    mimeTypeOfResponse: undefined,
  }

  public collectMetaInformationFromfile = (fileData, options) => {
    const headersFromFile = fileData[MidwayUtils.commonConstants.SET_HEADER];
    const cookiesFromFile = fileData[MidwayUtils.commonConstants.SET_COOKIE];
    const codeFromFile = fileData[MidwayUtils.commonConstants.SET_CODE];
    const contentTypeFromFile = fileData[MidwayUtils.commonConstants.SET_CONTENT_TYPE];

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
  public setCurrentMimeType = (mimeType) => {
    // TODO sgoff0 TS for the win! what is respose? internals.variables.mimeTypeOfRespose = mimeType;
    this.variables.mimeTypeOfResponse = mimeType;
  };

  public setHeadersAndCookies = (response, options: FileHandlerOptions) => {
    Logger.error("This method is setting content-type on chuncked replies which causes errors");
    // console.log("Setting headers: ", options.headers);
    const responseHeaders = this.setHeaders(response, options.headers);
    const responseCookies = this.setCookies(responseHeaders, options.cookies);
    return responseCookies;
  };

  public setHeaders = (response, headers) => {
    if (headers !== undefined) {
      for (const key in headers) {
        if (ignoreRegex.test(key)) {
          Logger.warn(`Ignoring header ${key} as it's known to cause issues`);
        } else {
          Logger.debug('Setting header: ' + key + ' to: ' + headers[key]);
          response = response.header(key, headers[key]);
        }
      }
    }
    return response;
  };

  public setCookies = (response, cookies) => {
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


  public getPathWithoutSessionId = (data) => {
    let path = Utils.getPath(data);

    // Check if path contains session id, if so remove it to get to the right file
    const sessions = SessionInfo.getSessions();
    for (const session in sessions) {
      const regex = new RegExp('^\\/' + session, 'i');
      path = path.replace(regex, '');
    }

    return path;
  };

  public getRouteMethod = (data: FileHandlerInput) => {
    return data.route.method();
  };

  public getCodeFromFilePath = (filePath: string) => {
    let code = filePath.split('.');
    code = code[0].split('-');
    return parseInt(code[code.length - 1]);
  };

  public handleCodeFile = (fileType, filePath, data) => {
    Logger.info('Found ' + fileType + ' file with code and returning that as response: ' + filePath);
    data.options.code = this.getCodeFromFilePath(filePath);
    Logger.debug('code: ' + data.options.code);
  };

  public retrieveFileDataBasedOnPayload = (payload, options) => {
    const appDir = appRoot;
    // console.log("AppDir: ", appDir);
    // const appDir = global.appRoot;
    let fileData;
    if (IsValidPath(payload)) {
      if (Fs.existsSync(Path.join(appDir, payload))) {
        // TODO sgoff0 figure out what I'm trying to do, boht MimeTypes and mimeType are not defined here
        // internals.variables.mimeTypeOfResponse = options.contentType || MimeTypes.lookup(payload) || mimeType;
        this.variables.mimeTypeOfResponse = options.contentType || MimeTypes.lookup(payload);

        fileData = Fs.readFileSync(payload); //when handling non JSON content, read the file that is set as value of setPayload
      } else {
        Logger.error('File ' + payload + ' does not exist');
        throw new Error('File ' + payload + ' does not exist');
      }
    } else {// assuming that setPayload is of type JSON
      this.variables.mimeTypeOfResponse = options.contentType || 'application/json';
      fileData = payload;
    }
    return fileData;
  };

  public selectFileFromDirectory = async (directory, fileName) => {
    let files;
    try {
      files = await Utils.readAndFilterDirectory(directory, fileName);
    } catch (error) {
      throw new Error(error);
    }

    // This is done to remove regex from file name for code specific files
    let filePath;
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
      for (const index in fileExtensionOrder) {
        if (files.indexOf(fileName + fileExtensionOrder[index]) > -1) {
          filePath = Path.join(directory, fileName + fileExtensionOrder[index]);
          break;
        }
      }
    }
    return filePath;
  };

  public getNextValue = (data, defaultFileName) => {
    // Pick file based on the number of times the URL is called
    // for ex: If URL is called for second time than pick urlPath-2.json.
    // If urlPath-2.json is not present than return urlPath.json
    const urlCalls = Utils.getSessionURLCallCount();
    const sessionId = Utils.getSessionId(data);
    const curSessionURLCallCount = urlCalls[sessionId];
    Logger.debug('Url Call Count for [' + sessionId + '] session is: ' + JSON.stringify(curSessionURLCallCount));
    let nextValue = 1;
    if (curSessionURLCallCount[defaultFileName] !== undefined) {
      const curVal = curSessionURLCallCount[defaultFileName];
      nextValue = curVal + 1;
    }
    curSessionURLCallCount[defaultFileName] = nextValue;
    Logger.debug(this.getPathWithoutSessionId(data) + ' for [' + sessionId + '] session is called for the count: ' + nextValue);
    Logger.debug('Url Call Count NOW for [' + sessionId + '] session is: ' + JSON.stringify(curSessionURLCallCount));
    return nextValue;
  };
}

export default new FileHandlerUtils();