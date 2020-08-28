"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const hapi_1 = require("./smocks/hapi");
const common_utils_1 = require("./utils/common-utils");
const server_controller_1 = require("./server-controller");
const file_handler_1 = require("./file-handler/file-handler");
const Logger = require("testarmada-midway-logger");
exports.default = {
    toPlugin: function (hapiPluginOptions, midwayOptions) {
        const mockDir = midwayOptions.mockedDirectory || './mocked-data';
        const fileHandler = file_handler_1.default(Path.join(process.cwd(), mockDir));
        const respondWithFilePlugin = fileHandler;
        Logger.debug("Init ReadMockDataFromFile");
        common_utils_1.default.initFileHandler(fileHandler);
        midwayOptions.respondWithFileHandler = respondWithFilePlugin;
        common_utils_1.default.initializeSessionURLCallCount();
        server_controller_1.default.addServerRoutesAndSessions(midwayOptions);
        Logger.info("Hapi Plugin Options: ", hapiPluginOptions);
        Logger.info("Midway options: ", midwayOptions);
        const plugin = hapi_1.default.toPlugin(hapiPluginOptions);
        return plugin;
    }
};
//# sourceMappingURL=plugin.js.map