// make this file a module
import * as Logger from 'testarmada-midway-logger';
import Constants from '../constants';
import * as Hapi from '@hapi/hapi';

const ResponseHandler = function (request, h: Hapi.ResponseToolkit) {
  setMockedResponseHeader(request);
  // TODO sgoff0 is this okay?
  Logger.warn("Removed reply.continue()");
  // return reply.continue();
};

function setMockedResponseHeader(request) {
  Logger.debug('Setting default header to show data is mocked for: ', request.url.path);
  if (request.response.headers && request.response.headers[Constants.MOCKED_RESPONSE] === undefined) {
    request.response.header(Constants.MOCKED_RESPONSE, true);
  }
}

export default ResponseHandler;