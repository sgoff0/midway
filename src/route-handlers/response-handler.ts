// make this file a module
import * as Logger from 'testarmada-midway-logger';
import Constants from '../constants';

const ResponseHandler = function (request, reply) {
  setMockedResponseHeader(request);
  return reply.continue();
};

function setMockedResponseHeader(request) {
  Logger.debug('Setting default header to show data is mocked for: ', request.url.path);
  if (request.response.headers && request.response.headers[Constants.MOCKED_RESPONSE] === undefined) {
    request.response.header(Constants.MOCKED_RESPONSE, true);
  }
}

export default ResponseHandler;