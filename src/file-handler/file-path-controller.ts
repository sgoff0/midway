import * as Path from 'path';
import * as Fs from 'fs';
import FileUtils from './file-handler-utils';
import Utils from './../utils/common-utils';
import * as Logger from 'testarmada-midway-logger';

class FilePathController {

  public getFilePath = (data, base, callback) => {
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

      this.findCodeSpecificFile(directory, fileNameByURLCountAndCode, data, function (codeFilePath) {
        if (codeFilePath) {
          return callback(codeFilePath);
        } else {
          this.findCountSpecificFile(directory, fileNameByURLCount, data, function (countFilePath) {
            if (countFilePath) {
              return callback(countFilePath);
            } else {
              this.findDefaultFile(defaultFileName, directory, data, function (defaultFilePath) {
                if (defaultFilePath) {
                  return callback(defaultFilePath);
                } else {
                  Logger.warn('No file found to respond with for directory: ' + directory);
                }
              });
            }
          });
        }
      });

    } else if (data.options.filePath) {
      const resolvedPath = this.createCustomLocationFilePath(base, data.options.filePath);
      return callback(resolvedPath);
    } else {
      Logger.debug('Creating file path based on URL');
      this.createFilePath(data, base, callback);
    }
  };

  public findCodeSpecificFile = (directory, fileNameByURLCountAndCode, data, callback) => {
    Logger.debug('>>>>> Trying to find code specific file');
    FileUtils.selectFileFromDirectory(directory, fileNameByURLCountAndCode, function (filePath) {
      Utils.checkFileExists(filePath, function (exists) {
        if (exists) {
          FileUtils.handleCodeFile('count specific', filePath, data);
          return callback(filePath);
        } else {
          return callback();
        }
      });
    });
  };

  public findCountSpecificFile = (directory, fileNameByURLCount, data, callback) => {
    Logger.debug('>>>>> Trying to find count specific file');
    FileUtils.selectFileFromDirectory(directory, fileNameByURLCount, function (filePath) {
      Utils.checkFileExists(filePath, function (exists) {
        if (exists) {
          Logger.info('Found count specific file without code and returning that as response: ' + filePath);
          return callback(filePath);
        } else {
          return callback();
        }
      });
    });
  };

  public findDefaultFile = (defaultFileName, directory, data, callback) => {
    Logger.debug('>>>>> Returning default file');
    const defaultFileNameWithCode = new RegExp(defaultFileName + '-code-\\d+', 'i');
    Logger.info('Count specific file NOT found. Looking for default file response with ' + 'code: ' + defaultFileNameWithCode);
    FileUtils.selectFileFromDirectory(directory, defaultFileNameWithCode, function (filePath) {
      Utils.checkFileExists(filePath, function (exists) {
        if (exists) {
          FileUtils.handleCodeFile('default', filePath, data);
          return callback(filePath);
        } else {
          Logger.info('Code specific default file NOT found. Returning default file ' + 'response: ' + defaultFileName);
          FileUtils.selectFileFromDirectory(directory, defaultFileName, function (defaultFilePath) {
            Utils.checkFileExists(defaultFilePath, function (defaultExists) {
              if (defaultExists) {
                return callback(defaultFilePath);
              } else {
                return callback();
              }
            });
          });
        }
      });
    });
  };

  public createCustomLocationFilePath = (base, filepath) => {
    Logger.debug('Creating file path based on custom file location');
    return Fs.existsSync(filepath) ? filepath : Path.join(base, filepath);
  };

  public createFilePath = (data, base, callback) => {
    const routeMethod = FileUtils.getRouteMethod(data);
    const path = Utils.getPathWithoutSessionIdFromData(data);
    const variant = data.variant;
    FileUtils.selectFileFromDirectory(Path.join(base, path, routeMethod), (variant.id && variant.id()) || variant, callback);
  };

  public getDefaultFileName = (data) => {
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