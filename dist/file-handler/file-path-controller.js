"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Path = require("path");
const Fs = require("fs");
const file_handler_utils_1 = require("./file-handler-utils");
const common_utils_1 = require("./../utils/common-utils");
const Logger = require("testarmada-midway-logger");
class FilePathController {
    constructor() {
        this.getFilePath = (data, base) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const defaultFileName = this.getDefaultFileName(data);
            const nextValue = file_handler_utils_1.default.getNextValue(data, defaultFileName);
            const sessionId = common_utils_1.default.getSessionId(data);
            const sessionMockId = common_utils_1.default.getSessionMockIds();
            const mockId = sessionMockId[sessionId];
            if (mockId !== undefined) {
                Logger.debug('Creating file path based on mockId');
                const directory = Path.join(base, mockId);
                const fileNameByURLCount = defaultFileName + '-' + nextValue;
                const fileNameByURLCountAndCode = new RegExp(defaultFileName + '-' + nextValue + '-code-\\d+', 'i');
                const codeFilePath = yield this.findCodeSpecificFile(directory, fileNameByURLCountAndCode, data);
                if (codeFilePath) {
                    return codeFilePath;
                }
                const countFilePath = yield this.findCountSpecificFile(directory, fileNameByURLCount, data);
                if (countFilePath) {
                    return countFilePath;
                }
                const defaultFilePath = yield this.findDefaultFile(defaultFileName, directory, data);
                if (defaultFilePath) {
                    return defaultFilePath;
                }
                else {
                    Logger.warn('No file found to respond with for directory: ' + directory);
                }
            }
            else if (data.options.filePath) {
                const resolvedPath = this.createCustomLocationFilePath(base, data.options.filePath);
                return resolvedPath;
            }
            else {
                Logger.debug('Creating file path based on URL');
                return yield this.createFilePath(data, base);
            }
        });
        this.findCodeSpecificFile = (directory, fileNameByURLCountAndCode, data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger.debug('>>>>> Trying to find code specific file');
            const filePath = yield file_handler_utils_1.default.selectFileFromDirectory(directory, fileNameByURLCountAndCode);
            const exists = yield common_utils_1.default.checkFileExists(filePath);
            if (exists) {
                file_handler_utils_1.default.handleCodeFile('count specific', filePath, data);
                return filePath;
            }
            else {
                return undefined;
            }
        });
        this.findCountSpecificFile = (directory, fileNameByURLCount, data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger.debug('>>>>> Trying to find count specific file');
            const filePath = yield file_handler_utils_1.default.selectFileFromDirectory(directory, fileNameByURLCount);
            const exists = yield common_utils_1.default.checkFileExists(filePath);
            if (exists) {
                Logger.info('Found count specific file without code and returning that as response: ' + filePath);
                return filePath;
            }
            else {
                return undefined;
            }
        });
        this.findDefaultFile = (defaultFileName, directory, data) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger.debug('>>>>> Returning default file');
            const defaultFileNameWithCode = new RegExp(defaultFileName + '-code-\\d+', 'i');
            Logger.info('Count specific file NOT found. Looking for default file response with ' + 'code: ' + defaultFileNameWithCode);
            const filePath = yield file_handler_utils_1.default.selectFileFromDirectory(directory, defaultFileNameWithCode);
            const exists = yield common_utils_1.default.checkFileExists(filePath);
            if (exists) {
                file_handler_utils_1.default.handleCodeFile('default', filePath, data);
                return filePath;
            }
            else {
                Logger.info('Code specific default file NOT found. Returning default file ' + 'response: ' + defaultFileName);
                const defaultFilePath = yield file_handler_utils_1.default.selectFileFromDirectory(directory, defaultFileName);
                const defaultExists = yield common_utils_1.default.checkFileExists(defaultFileName);
                if (defaultExists) {
                    return defaultFilePath;
                }
                else {
                    return undefined;
                }
            }
            ;
        });
        this.createCustomLocationFilePath = (base, filepath) => {
            Logger.debug('Creating file path based on custom file location');
            return Fs.existsSync(filepath) ? filepath : Path.join(base, filepath);
        };
        this.createFilePath = (data, base) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const routeMethod = file_handler_utils_1.default.getRouteMethod(data);
            const path = common_utils_1.default.getPathWithoutSessionIdFromData(data);
            const variant = data.variant;
            return yield file_handler_utils_1.default.selectFileFromDirectory(Path.join(base, path, routeMethod), (variant.id && variant.id()) || variant);
        });
        this.getDefaultFileName = (data) => {
            const fileFromPath = common_utils_1.default.getPathWithoutSessionIdFromData(data).replace(/\//g, '-');
            let defaultFileName = fileFromPath.indexOf('-') === 0 ? fileFromPath.substring(1) : fileFromPath;
            if (defaultFileName) {
                defaultFileName = defaultFileName + '-' + file_handler_utils_1.default.getRouteMethod(data);
            }
            else {
                defaultFileName = file_handler_utils_1.default.getRouteMethod(data);
            }
            Logger.debug('Default file name: ' + defaultFileName);
            return defaultFileName;
        };
    }
}
exports.default = new FilePathController();
//# sourceMappingURL=file-path-controller.js.map