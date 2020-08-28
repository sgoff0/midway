"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Path = require("path");
const common_utils_1 = require("./utils/common-utils");
const MidwayServerRoutes = require("./server-routes/midway-routes-manager");
const midway_plugin_controller_1 = require("./utils/midway-plugin-controller");
const Logger = require("testarmada-midway-logger");
const configuration_parameters_1 = require("./utils/configuration-parameters");
const constants_1 = require("./constants");
const file_handler_1 = require("./file-handler/file-handler");
const Hapi = require("@hapi/hapi");
class ServerController {
    constructor() {
        this.start = (midwayOptions) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const DEFAULT_MOCK_DIRECTORY = Path.join(process.cwd(), constants_1.default.MIDWAY_DEFAULT_MOCKED_DATA_LOC);
            midwayOptions.startTime = new Date();
            midwayOptions.port = configuration_parameters_1.argv.midwayPort || midwayOptions.port || 8080;
            midwayOptions.httpsPort = configuration_parameters_1.argv.midwayHttpsPort || midwayOptions.httpsPort;
            midwayOptions.host = (configuration_parameters_1.argv.midwayHost || midwayOptions.host || 'localhost').replace(/.*?:\/\//g, '');
            midwayOptions.project = midwayOptions.project || constants_1.default.DEFAULT;
            midwayOptions.proxyPort = configuration_parameters_1.argv.proxyPort || midwayOptions.proxyPort;
            midwayOptions.proxyHost = configuration_parameters_1.argv.proxyHost || midwayOptions.proxyHost || 'localhost';
            midwayOptions.mockedDirectory = configuration_parameters_1.argv.mockedData || midwayOptions.mockedDirectory || DEFAULT_MOCK_DIRECTORY;
            midwayOptions.sessions = configuration_parameters_1.argv.midwaySessions || midwayOptions.sessions || 0;
            midwayOptions.resolvedPath = common_utils_1.default.checkDirectoryExists(midwayOptions.mockedDirectory) ? midwayOptions.mockedDirectory : DEFAULT_MOCK_DIRECTORY;
            midwayOptions.respondWithFileHandler = file_handler_1.default(midwayOptions.resolvedPath);
            if (midwayOptions.collectMetrics === undefined) {
                midwayOptions.collectMetrics = true;
            }
            Logger.info('Starting midway server on http at http://' + midwayOptions.host + ':' + midwayOptions.port + '/midway');
            if (midwayOptions.httpsPort) {
                Logger.info('Starting midway server on https at https://' + midwayOptions.host + ':' + midwayOptions.httpsPort + '/midway');
            }
            const server = createHapiServer(midwayOptions);
            Logger.warn("Confirm add server routes is working");
            this.addServerRoutesAndSessions(midwayOptions);
            Logger.debug("Init ReadMockDataFromFile");
            common_utils_1.default.initFileHandler(midwayOptions.respondWithFileHandler);
            yield midway_plugin_controller_1.default.runHapiWithPlugins(server, midwayOptions);
            server.start();
            return server;
        });
        this.stop = (server) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            common_utils_1.default.setServerRunningStatus(false);
            try {
                yield server.stop();
                Logger.debug('Midway server stopped');
            }
            catch (e) {
                Logger.error("Error stopping server");
            }
        });
        this.addServerRoutesAndSessions = (midwayOptions) => {
            if (!common_utils_1.default.isServerRunning()) {
                common_utils_1.default.setServerRunningStatus(true);
                common_utils_1.default.setServerProperties(midwayOptions);
                MidwayServerRoutes.addMidwayServerAPIs();
                Logger.debug('Sessions to add: ' + midwayOptions.sessions);
                common_utils_1.default.initializeSessionURLCallCount();
            }
        };
    }
}
function createHapiServer(midwayOptions) {
    const server = new Hapi.Server({
        port: midwayOptions.port,
    });
    return server;
}
exports.default = new ServerController();
//# sourceMappingURL=server-controller.js.map