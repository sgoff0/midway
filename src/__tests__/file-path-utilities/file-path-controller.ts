// const FilePathController = require('../../lib/file-handler/file-path-controller');
// const Expect = require('chai').expect;

import filePathController from "../../file-handler/file-path-controller";
import { FileHandlerInput } from '../../file-handler/file-handler';

describe('File-Path-Controller', function () {
  it('should get default name with route having no - in the path', function () {
    const mockedData = {
      route: {
        path: function () {
          return 'message';
        },
        method: function () {
          return 'GET';
        }
      }
    };
    expect(filePathController.getDefaultFileName(mockedData)).toBe('message-GET');
  });

  it('should get default name when route is undefined', function () {
    const mockedData = {
      route: {
        path: function () {
          return '';
        },
        method: function () {
          return 'GET';
        }
      }
    };
    expect(filePathController.getDefaultFileName(mockedData)).toBe('GET');
  });

});
