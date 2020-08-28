"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger = require("testarmada-midway-logger");
const constants_1 = require("../constants");
const ResponseHandler = function (request, h) {
    setMockedResponseHeader(request);
    Logger.warn("Removed reply.continue()");
};
function setMockedResponseHeader(request) {
    Logger.debug('Setting default header to show data is mocked for: ', request.url.path);
    if (request.response.headers && request.response.headers[constants_1.default.MOCKED_RESPONSE] === undefined) {
        request.response.header(constants_1.default.MOCKED_RESPONSE, true);
    }
}
exports.default = ResponseHandler;
//# sourceMappingURL=response-handler.js.map