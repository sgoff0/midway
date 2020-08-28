"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Path = require("path");
const MimeTypes = require("mime-types");
const common_utils_1 = require("./../utils/common-utils");
const Logger = require("testarmada-midway-logger");
const _ = require("lodash");
const constants_1 = require("./../constants");
const MidwayUtils = require('testarmada-midway-util');
const file_handler_utils_1 = require("./file-handler-utils");
const file_path_controller_1 = require("./file-path-controller");
const util = require("util");
const fs = require("fs");
const readFile = util.promisify(fs.readFile);
const fileExtensionOrder = ['.json', '.html', '.txt'];
exports.default = (mockDirectoryPath) => {
    return (data) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const filePath = yield file_path_controller_1.default.getFilePath(data, mockDirectoryPath);
        Logger.debug('Filepath is : ' + filePath);
        const mimeType = MimeTypes.lookup(filePath);
        file_handler_utils_1.default.variables.mimeTypeOfResponse = mimeType;
        const fileExtension = Path.extname(filePath);
        Logger.debug('File extension is ' + fileExtension);
        if (_.includes(fileExtensionOrder, fileExtension)) {
            let rawFileData;
            try {
                rawFileData = yield readFile(filePath, 'utf-8');
                const fileData = processFileData(rawFileData, mimeType, data);
                Logger.debug("File data: ", fileData);
                return yield prepareAndSendResponse(data.h, fileData, data.options.code, data.options, file_handler_utils_1.default.variables.mimeTypeOfResponse);
            }
            catch (err) {
                return yield handleParsingErrorCases(err, data.h, rawFileData, data, filePath);
            }
        }
        else {
            Logger.debug('Returning file as response:', filePath);
            return data.h.file(filePath);
        }
    });
};
function handleParsingErrorCases(err, h, rawFileData, data, filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        Logger.warn(err.message);
        if (err instanceof SyntaxError) {
            return handleJsonFileWithSyntaxError(h, rawFileData, data, filePath);
        }
        updateCodeIfFileNotFound(err, data, filePath);
        if (data.options.code) {
            return prepareAndSendResponse(h, undefined, data.options.code, data.options);
        }
        else {
            return prepareAndSendResponse(h, err.message, constants_1.default.NOT_FOUND, data.options);
        }
    });
}
function handleJsonFileWithSyntaxError(h, rawFileData, data, filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        Logger.warn('Invalid syntax in: ' + filePath + ' returning content to client anyway');
        return prepareAndSendResponse(h, rawFileData, data.options.code, data.options, file_handler_utils_1.default.variables.mimeTypeOfResponse);
    });
}
function updateCodeIfFileNotFound(err, data, filePath) {
    if (err.code === 'ENOENT') {
        err.message = 'File not found at: ' + filePath;
        data.options.code = data.options.code || constants_1.default.NOT_FOUND;
    }
}
function processFileData(fileData, mimeType, data) {
    if (mimeType && _.includes(mimeType, 'json')) {
        fileData = JSON.parse(fileData);
        file_handler_utils_1.default.collectMetaInformationFromfile(fileData, data.options);
        const setPayload = fileData[MidwayUtils.commonConstants.SET_PAYLOAD];
        if (setPayload) {
            fileData = file_handler_utils_1.default.retrieveFileDataBasedOnPayload(setPayload, data.options);
        }
        if (data.options.transpose !== undefined) {
            fileData = common_utils_1.default.transposeData(fileData, data.options.transpose);
        }
    }
    return fileData;
}
function prepareAndSendResponse(h, body, code = 200, options, mimeType) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let response;
        if (mimeType) {
            response = h.response(body).type(mimeType).code(code);
        }
        else if (body) {
            response = h.response(body).code(code);
        }
        else {
            response = h.response().code(code);
        }
        Logger.warn("Skipping setting headers and cookies call");
        const res = file_handler_utils_1.default.setHeadersAndCookies(response, options);
        return sendResponse(res, options.delay);
    });
}
function sendResponse(response, delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(response);
        }, delay);
    });
}
//# sourceMappingURL=file-handler.js.map