"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonUtils = void 0;
const tslib_1 = require("tslib");
const kill_process_1 = require("./kill-process");
const Fs = require("fs");
const Logger = require("testarmada-midway-logger");
const session_info_1 = require("./../session-manager/session-info");
const MidwayUtil = require("testarmada-midway-util");
const constants_1 = require("../constants");
const file_handler_1 = require("../file-handler/file-handler");
const Rp = require('request-promise');
let FileHandler;
const sessionMockIds = {
    default: undefined
};
const sessionURLCallCount = {};
let serverStarted = false;
const serverProps = {};
let proxyService;
let kairosDbUrl;
const util = require("util");
const fs = require("fs");
const readFile = util.promisify(fs.readFile);
const readDir = util.promisify(fs.readdir);
const exists = util.promisify(fs.exists);
function makeNetworkCall(name, requestOptions, options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield Rp(requestOptions);
            Logger.debug(`${name} POST Call is successful: `, requestOptions);
        }
        catch (err) {
            Logger.error(`${name} POST Call Not successful with options: `, requestOptions, err.message);
        }
    });
}
class CommonUtils {
    constructor() {
        this.initFileHandler = (fileHandler) => {
            FileHandler = fileHandler;
        };
        this.initProxyApi = (proxyApi) => {
            proxyService = proxyApi;
        };
        this.respondWithFile = (route, h, options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _a;
            Logger.debug('Debug: The current Mock Id are: ', sessionMockIds);
            Logger.debug("Mocked directory: ", (_a = route.route) === null || _a === void 0 ? void 0 : _a.mockedDirectory);
            const handler = (route && route.route && route.route.mockedDirectory) ? file_handler_1.default(route.route.mockedDirectory) : FileHandler;
            let routeVal;
            let variantVal;
            if (route._id && route._id !== constants_1.default.DEFAULT) {
                routeVal = route._route;
                variantVal = route._id;
            }
            else {
                routeVal = route.variant._route;
                variantVal = route.variant;
            }
            const retVal = yield handler({
                options: options,
                h: h,
                route: routeVal,
                variant: variantVal
            });
            return retVal;
        });
        this.respondWithMockVariant = (route, variant, req, h) => {
            if (route && route.route && route.route._variants && route.route._variants[variant]) {
                return route.route._variants[variant].handler(req, h);
            }
            else {
                if (h) {
                    return 'No such variant: ' + variant + ' defined';
                }
                else {
                    return 'Reply object must be defined';
                }
            }
        };
        this.getSessionMockIds = () => {
            return sessionMockIds;
        };
        this.getSessionURLCallCount = () => {
            return sessionURLCallCount;
        };
        this.initializeSessionURLCallCount = () => {
            const sessions = session_info_1.default.getSessions();
            for (const sessionId in sessions) {
                sessionURLCallCount[sessionId] = {};
            }
            sessionURLCallCount[constants_1.default.DEFAULT_SESSION] = {};
        };
        this.isServerRunning = () => {
            return serverStarted;
        };
        this.setServerRunningStatus = (status) => {
            serverStarted = status;
        };
        this.killProcess = (pid, signal, callback) => {
            return kill_process_1.default(pid, signal, callback);
        };
        this.substituteData = (object, valueToSubstitute) => {
            for (const key in object) {
                if (typeof object[key] === 'object') {
                    this.substituteData(object[key], valueToSubstitute);
                }
                else {
                    if (valueToSubstitute[key]) {
                        object[key] = valueToSubstitute[key];
                    }
                }
            }
            return object;
        };
        this.writeFile = (fileLocation, fileData, callback) => {
            Fs.writeFile(fileLocation, fileData, function (err) {
                if (err) {
                    return callback(err);
                }
            });
        };
        this.deleteFile = (filePath, callback) => {
            Fs.unlink(filePath, function (err) {
                if (err) {
                    return callback(err);
                }
            });
        };
        this.readJsonFile = (fileLocation) => {
            return MidwayUtil.readJsonFile(fileLocation);
        };
        this.transposeData = (object, valueToSubstitute) => {
            return MidwayUtil.transposeData(object, valueToSubstitute);
        };
        this.readDirectory = (dirLocation) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield readDir(dirLocation);
        });
        this.readAndFilterDirectory = (dirLocation, fileName) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const files = yield this.readDirectory(dirLocation);
                const filteredFile = files.filter(function (file) {
                    Logger.debug('File to match: ' + file);
                    const foundFiles = file.match(fileName);
                    Logger.debug('foundFiles: ' + foundFiles);
                    if (foundFiles && file.indexOf(foundFiles + '.') > -1) {
                        Logger.debug('Selected file: ' + file);
                        return true;
                    }
                    else {
                        return false;
                    }
                });
                Logger.debug('filteredFile: ' + filteredFile);
                return filteredFile;
            }
            catch (error) {
                if (error.code === 'ENOENT') {
                    const errorMsg = 'Directory not found at: ' + dirLocation;
                    Logger.error(errorMsg);
                    return errorMsg;
                }
                else {
                    Logger.error(error);
                    return error;
                }
            }
        });
        this.readFile = (fileLocation) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return readFile(fileLocation, 'utf-8');
        });
        this.checkDirectoryExists = (dirLocation) => {
            try {
                return Fs.statSync(dirLocation).isDirectory();
            }
            catch (e) {
                if (e.code == 'ENOENT') {
                    Logger.warn('Directory ' + dirLocation + ' does not exist.');
                }
                else {
                    Logger.warn('Exception fs.statSync (' + dirLocation + '): ' + e);
                }
                return false;
            }
        };
        this.checkFileExists = (fileLocation) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return exists(fileLocation);
        });
        this.setMockId = (mockId, sessionId) => {
            sessionId = sessionId || constants_1.default.DEFAULT_SESSION;
            sessionMockIds[sessionId] = mockId;
            Logger.debug('Setting Mock Id for [' + sessionId + '] session to: ' + mockId);
            if (proxyService) {
                proxyService.setMockId({ mockId: mockId, sessionId: sessionId }, function (err) {
                    if (err) {
                        Logger.warn('Problem when updating proxy: ' + err);
                    }
                    Logger.debug('Mock Id for [' + sessionId + '] session set to: ' + mockId + ' in proxy api');
                });
            }
        };
        this.getMockId = (sessionId) => {
            let mockId = sessionMockIds.default;
            let session = constants_1.default.DEFAULT_SESSION;
            if (sessionId !== undefined) {
                mockId = sessionMockIds[sessionId];
                session = sessionId;
            }
            Logger.debug('Current Mock Id for sessionId ' + session + ' is: ' + mockId);
            return mockId;
        };
        this.resetMockVariantWithSession = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.hostName) {
                throw new Error('Missing hostName in options');
            }
            if (options.midwaySessionId == undefined) {
                throw new Error('Missing sessionID in options');
            }
            const protocol = options.useHttp ? 'http' : 'https';
            const url = `${protocol}://${options.hostName}${constants_1.default.MIDWAY_API_PATH}/sessionVariantState/reset/${options.midwaySessionId}`;
            const requestOptions = {
                method: 'POST',
                json: true,
                url: url
            };
            return yield makeNetworkCall('ResetMockVariantWithSession', requestOptions, options);
        });
        this.setMockVariantWithSession = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.hostName) {
                throw new Error('Missing hostName in options');
            }
            if (!options.fixtureToVariantMapping) {
                throw new Error('Missing fixture to variant mapping in options');
            }
            if (options.midwaySessionId == undefined) {
                throw new Error('Missing sessionID in options');
            }
            const protocol = options.useHttp ? 'http' : 'https';
            const url = `${protocol}://${options.hostName}${constants_1.default.MIDWAY_API_PATH}/sessionVariantState/set/${options.midwaySessionId}`;
            const payload = options.fixtureToVariantMapping;
            const requestOptions = {
                method: 'POST',
                body: payload,
                json: true,
                url: url
            };
            return yield makeNetworkCall('SetMockVariantWithSession', requestOptions, options);
        });
        this.setMockVariant = (options, callback) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.mockPort) {
                return callback(new Error('Missing mockPort in options'));
            }
            if (!options.variant) {
                return callback(new Error('Missing variant in options'));
            }
            if (!options.fixture) {
                return callback(new Error('Missing fixture in options'));
            }
            let url = 'http://localhost:' + options.mockPort + constants_1.default.MIDWAY_API_PATH + '/route/' + encodeURIComponent(options.fixture);
            if (options.midwaySessionId) {
                url += '-' + options.midwaySessionId;
            }
            const payload = {
                variant: options.variant
            };
            const requestOptions = {
                method: 'POST',
                body: payload,
                json: true,
                url: url
            };
            return yield Rp(requestOptions).then(function () {
                Logger.debug('SetMockVariant POST Call is successful: ', requestOptions);
                if (callback) {
                    return callback(null, options);
                }
            }, function (err) {
                Logger.error('SetMockVariant POST Call Not successful with options: ', requestOptions, err.message);
                if (callback) {
                    return callback(err, 'failed');
                }
            }).catch(function (err) {
                if (callback) {
                    return callback(err);
                }
            });
        });
        this.resetMockId = (sessionId) => {
            sessionId = sessionId || constants_1.default.DEFAULT_SESSION;
            sessionMockIds[sessionId] = undefined;
            Logger.debug('Re-Setting Mock Id for [' + sessionId + '] session');
            if (proxyService) {
                proxyService.resetMockId({ sessionId: sessionId }, function (err) {
                    if (err) {
                        Logger.warn('Problem when updating proxy: ' + err);
                    }
                    Logger.debug('Reset Mock Id for [' + sessionId + '] in proxy api');
                });
            }
        };
        this.resetURLCount = (sessionId) => {
            sessionId = sessionId || constants_1.default.DEFAULT_SESSION;
            sessionURLCallCount[sessionId] = {};
            Logger.debug('Re-Setting URL count for [' + sessionId + '] session');
        };
        this.getURLCount = (sessionId) => {
            sessionId = sessionId || constants_1.default.DEFAULT_SESSION;
            Logger.debug('Getting URL count for [' + sessionId + '] session: ' + sessionURLCallCount[sessionId]);
            return sessionURLCallCount[sessionId];
        };
        this.checkIfCertsExists = (keyFile, certFile) => {
            try {
                return Fs.statSync(keyFile).isFile() && Fs.statSync(certFile).isFile();
            }
            catch (e) {
                Logger.debug(e.message);
                return false;
            }
        };
        this.setServerProperties = (options) => {
            serverProps[constants_1.default.HTTP_PORT] = options.port;
            serverProps[constants_1.default.HTTPS_PORT] = options.httpsPort;
            serverProps[constants_1.default.PROJECT] = options.project || constants_1.default.DEFAULT;
        };
        this.setHttpPort = (httpPort) => {
            serverProps[constants_1.default.HTTP_PORT] = httpPort;
        };
        this.getProjectName = () => {
            return serverProps[constants_1.default.PROJECT];
        };
        this.getPortInfo = () => {
            const portInfo = {};
            portInfo[constants_1.default.HTTP_PORT] = serverProps[constants_1.default.HTTP_PORT] || constants_1.default.NOT_AVAILABLE;
            portInfo[constants_1.default.HTTPS_PORT] = serverProps[constants_1.default.HTTPS_PORT] || constants_1.default.NOT_AVAILABLE;
            return portInfo;
        };
        this.getPathWithoutSessionId = (path) => {
            const sessions = session_info_1.default.getSessions();
            for (const session in sessions) {
                const regex = new RegExp('^\\/' + session, 'i');
                path = path.toString().replace(regex, '');
            }
            return path;
        };
        this.getPathWithoutSessionIdFromData = (data) => {
            const path = this.getPath(data);
            return this.getPathWithoutSessionId(path);
        };
        this.getPath = (data) => {
            const path = data.route.path().replace(/[{}}]\.*/g, '');
            return path;
        };
        this.getSessionId = (data) => {
            const path = this.getPath(data);
            const sessions = session_info_1.default.getSessions();
            for (const session in sessions) {
                const regex = new RegExp('^\\/' + session, 'i');
                if (regex.test(path)) {
                    return session;
                }
            }
            return constants_1.default.DEFAULT_SESSION;
        };
    }
}
exports.CommonUtils = CommonUtils;
exports.default = new CommonUtils();
//# sourceMappingURL=common-utils.js.map