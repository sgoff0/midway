"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const pathHelpers_1 = require("../utils/pathHelpers");
const Path = require("path");
const MimeTypes = require("mime-types");
const common_utils_1 = require("./../utils/common-utils");
const Logger = require("testarmada-midway-logger");
const session_info_1 = require("./../session-manager/session-info");
const MidwayUtils = require('testarmada-midway-util');
const Fs = require("fs");
const IsValidPath = require('is-valid-path');
const fileExtensionOrder = ['.json', '.html', '.txt'];
const headersToIgnore = ['Transfer-Encoding'];
const ignoreRegex = new RegExp(headersToIgnore.join("|"), "i");
class FileHandlerUtils {
    constructor() {
        this.variables = {
            mimeTypeOfResponse: undefined,
        };
        this.collectMetaInformationFromfile = (fileData, options) => {
            const headersFromFile = fileData[MidwayUtils.commonConstants.SET_HEADER];
            const cookiesFromFile = fileData[MidwayUtils.commonConstants.SET_COOKIE];
            const codeFromFile = fileData[MidwayUtils.commonConstants.SET_CODE];
            const contentTypeFromFile = fileData[MidwayUtils.commonConstants.SET_CONTENT_TYPE];
            if (headersFromFile) {
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
        this.setCurrentMimeType = (mimeType) => {
            this.variables.mimeTypeOfResponse = mimeType;
        };
        this.setHeadersAndCookies = (response, options) => {
            const responseHeaders = this.setHeaders(response, options.headers);
            const responseCookies = this.setCookies(responseHeaders, options.cookies);
            return responseCookies;
        };
        this.setHeaders = (response, headers) => {
            if (headers !== undefined) {
                for (const key in headers) {
                    if (ignoreRegex.test(key)) {
                        Logger.warn(`Ignoring header ${key} as it's known to cause issues`);
                    }
                    else {
                        Logger.debug('Setting header: ' + key + ' to: ' + headers[key]);
                        response = response.header(key, headers[key]);
                    }
                }
            }
            return response;
        };
        this.setCookies = (response, cookies) => {
            if (cookies !== undefined) {
                cookies.forEach(function (cookie) {
                    Logger.debug('Setting Cookie: ' + cookie.name + ' to: ' + cookie.value);
                    if (cookie.options !== undefined) {
                        response = response.state(cookie.name, cookie.value, cookie.options);
                    }
                    else {
                        response = response.state(cookie.name, cookie.value);
                    }
                });
            }
            return response;
        };
        this.getPathWithoutSessionId = (data) => {
            let path = common_utils_1.default.getPath(data);
            const sessions = session_info_1.default.getSessions();
            for (const session in sessions) {
                const regex = new RegExp('^\\/' + session, 'i');
                path = path.replace(regex, '');
            }
            return path;
        };
        this.getRouteMethod = (data) => {
            return data.route.method();
        };
        this.getCodeFromFilePath = (filePath) => {
            let code = filePath.split('.');
            code = code[0].split('-');
            return parseInt(code[code.length - 1]);
        };
        this.handleCodeFile = (fileType, filePath, data) => {
            Logger.info('Found ' + fileType + ' file with code and returning that as response: ' + filePath);
            data.options.code = this.getCodeFromFilePath(filePath);
            Logger.debug('code: ' + data.options.code);
        };
        this.retrieveFileDataBasedOnPayload = (payload, options) => {
            const appDir = pathHelpers_1.appRoot;
            let fileData;
            if (IsValidPath(payload)) {
                if (Fs.existsSync(Path.join(appDir, payload))) {
                    this.variables.mimeTypeOfResponse = options.contentType || MimeTypes.lookup(payload);
                    fileData = Fs.readFileSync(payload);
                }
                else {
                    Logger.error('File ' + payload + ' does not exist');
                    throw new Error('File ' + payload + ' does not exist');
                }
            }
            else {
                this.variables.mimeTypeOfResponse = options.contentType || 'application/json';
                fileData = payload;
            }
            return fileData;
        };
        this.selectFileFromDirectory = (directory, fileName) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let files;
            try {
                files = yield common_utils_1.default.readAndFilterDirectory(directory, fileName);
            }
            catch (error) {
                throw new Error(error);
            }
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
            }
            else if (files.length === 1) {
                filePath = Path.join(directory, files[0]);
            }
            else {
                for (const index in fileExtensionOrder) {
                    if (files.indexOf(fileName + fileExtensionOrder[index]) > -1) {
                        filePath = Path.join(directory, fileName + fileExtensionOrder[index]);
                        break;
                    }
                }
            }
            return filePath;
        });
        this.getNextValue = (data, defaultFileName) => {
            const urlCalls = common_utils_1.default.getSessionURLCallCount();
            const sessionId = common_utils_1.default.getSessionId(data);
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
}
exports.default = new FileHandlerUtils();
//# sourceMappingURL=file-handler-utils.js.map