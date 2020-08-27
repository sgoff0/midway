/**
 * Read filesystem and reply with response
 */
import * as Fs from 'fs';
import * as Path from 'path';
import * as MimeTypes from 'mime-types';
import Utils from './../utils/common-utils';
import * as Logger from 'testarmada-midway-logger';
import * as _ from 'lodash';
import Constants from './../constants';
const MidwayUtils = require('testarmada-midway-util');
import FileUtils from './file-handler-utils';
import FilePathHelper from './file-path-controller';

const fileExtensionOrder = ['.json', '.html', '.txt'];

interface Data {
  options: Options;
  reply: any;
  route: any;
  variant: any;
}

interface Options {
  code: number;
  headers: Headers;
}

interface Headers {
  Date: string;
  'Strict-Transport-Security': string;
  'X-Powered-By': string;
  'Cache-Control': string;
  Pragma: string;
  Expires: string;
  'Site-Id': string;
  'Set-Cookie': string;
  'Keep-Alive': string;
  'Content-Type': string;
  'Content-Language': string;
  'Transfer-Encoding': string;
  Connection: string;
}

/***
 *
 * Provides functionality for retrieving mock data from the filesystem.
 *
 */
export default (mockDirectoryPath: string) => {
  return (data: Data) => {
    // Called when API is hit, likely to read file in realtime
    const reply = data.reply;

    FilePathHelper.getFilePath(data, mockDirectoryPath, function (filePath) {
      Logger.debug('Filepath is : ' + filePath);
      const mimeType = MimeTypes.lookup(filePath);
      FileUtils.variables.mimeTypeOfResponse = mimeType;

      const fileExtension = Path.extname(filePath);
      Logger.debug('File extension is ' + fileExtension);

      if (_.includes(fileExtensionOrder, fileExtension)) {
        let rawFileData;

        try {
          rawFileData = Fs.readFileSync(filePath, 'utf-8');
          const fileData = processFileData(rawFileData, mimeType, data);
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
  if (mimeType && _.includes(mimeType, 'json')) {
    fileData = JSON.parse(fileData);
    //set headers and cookies from the mocked file, if present.
    FileUtils.collectMetaInformationFromfile(fileData, data.options);
    const setPayload = fileData[MidwayUtils.commonConstants.SET_PAYLOAD];
    if (setPayload) {
      fileData = FileUtils.retrieveFileDataBasedOnPayload(setPayload, data.options);
    }


    if (data.options.transpose !== undefined) {
      fileData = Utils.transposeData(fileData, data.options.transpose);
    }
  }
  return fileData;
}

function prepareAndSendResponse(reply, body, code = 200, options, mimeType?) {
  let response;
  // var code = code || 200;
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
  const res = FileUtils.setHeadersAndCookies(response, options);
  return sendResponse(res, options.delay);
}

function sendResponse(response, delay) {
  setTimeout(function () {
    response.send();
  }, delay);
}