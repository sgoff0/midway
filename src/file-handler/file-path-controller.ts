import * as Path from 'path';
import * as Fs from 'fs';
import FileUtils from './file-handler-utils';
import Utils from './../utils/common-utils';
import * as Logger from 'testarmada-midway-logger';
import { FileHandlerInput } from './file-handler';

class FilePathController {

  public getFilePath = async (data: FileHandlerInput, base) => {
    const defaultFileName = this.getDefaultFileName(data);
    const nextValue = FileUtils.getNextValue(data, defaultFileName);
    const sessionId = Utils.getSessionId(data);
    const sessionMockId = Utils.getSessionMockIds();
    const mockId = sessionMockId[sessionId];

    if (mockId !== undefined) {
      Logger.debug('Creating file path based on mockId');

      const directory = Path.join(base, mockId);
      const fileNameByURLCount = defaultFileName + '-' + nextValue;
      const fileNameByURLCountAndCode = new RegExp(defaultFileName + '-' + nextValue + '-code-\\d+', 'i');

      const codeFilePath = await this.findCodeSpecificFile(directory, fileNameByURLCountAndCode, data);
      if (codeFilePath) {
        return codeFilePath;
      }
      const countFilePath = await this.findCountSpecificFile(directory, fileNameByURLCount, data);
      if (countFilePath) {
        return countFilePath;
      }

      const defaultFilePath = await this.findDefaultFile(defaultFileName, directory, data);
      if (defaultFilePath) {
        return defaultFilePath;
      } else {
        Logger.warn('No file found to respond with for directory: ' + directory);
      }
    } else if (data.options.filePath) {
      const resolvedPath = this.createCustomLocationFilePath(base, data.options.filePath);
      return resolvedPath;
    } else {
      Logger.debug('Creating file path based on URL');
      return await this.createFilePath(data, base);
    }
  };

  public findCodeSpecificFile = async (directory, fileNameByURLCountAndCode, data) => {
    Logger.debug('>>>>> Trying to find code specific file');
    const filePath = await FileUtils.selectFileFromDirectory(directory, fileNameByURLCountAndCode);
    const exists = await Utils.checkFileExists(filePath);
    if (exists) {
      FileUtils.handleCodeFile('count specific', filePath, data);
      return filePath;
    } else {
      return undefined;
    }
  };

  public findCountSpecificFile = async (directory, fileNameByURLCount, data) => {
    Logger.debug('>>>>> Trying to find count specific file');
    const filePath = await FileUtils.selectFileFromDirectory(directory, fileNameByURLCount);
    const exists = await Utils.checkFileExists(filePath);
    if (exists) {
      Logger.info('Found count specific file without code and returning that as response: ' + filePath);
      return filePath;
    } else {
      return undefined;
    }
  };

  public findDefaultFile = async (defaultFileName, directory, data) => {
    Logger.debug('>>>>> Returning default file');
    const defaultFileNameWithCode = new RegExp(defaultFileName + '-code-\\d+', 'i');
    Logger.info('Count specific file NOT found. Looking for default file response with ' + 'code: ' + defaultFileNameWithCode);
    const filePath = await FileUtils.selectFileFromDirectory(directory, defaultFileNameWithCode);
    const exists = await Utils.checkFileExists(filePath);

    if (exists) {
      FileUtils.handleCodeFile('default', filePath, data);
      return filePath;
    } else {
      Logger.info('Code specific default file NOT found. Returning default file ' + 'response: ' + defaultFileName);

      const defaultFilePath = await FileUtils.selectFileFromDirectory(directory, defaultFileName);
      const defaultExists = await Utils.checkFileExists(defaultFileName);
      if (defaultExists) {
        return defaultFilePath;
      } else {
        return undefined;
      }
    };
  };

  public createCustomLocationFilePath = (base, filepath) => {
    Logger.debug('Creating file path based on custom file location');
    return Fs.existsSync(filepath) ? filepath : Path.join(base, filepath);
  };

  public createFilePath = async (data: FileHandlerInput, base) => {
    const routeMethod = FileUtils.getRouteMethod(data);
    const path = Utils.getPathWithoutSessionIdFromData(data);
    const variant = data.variant;
    return await FileUtils.selectFileFromDirectory(Path.join(base, path, routeMethod), (variant.id && variant.id()) || variant);
  };

  public getDefaultFileName = (data: FileHandlerInput) => {
    // Get the filename for the url to respond
    const fileFromPath = Utils.getPathWithoutSessionIdFromData(data).replace(/\//g, '-');
    let defaultFileName = fileFromPath.indexOf('-') === 0 ? fileFromPath.substring(1) : fileFromPath;
    if (defaultFileName) {
      defaultFileName = defaultFileName + '-' + FileUtils.getRouteMethod(data);
    } else {
      defaultFileName = FileUtils.getRouteMethod(data);
    }
    Logger.debug('Default file name: ' + defaultFileName);
    return defaultFileName;
  };
}

export default new FilePathController();