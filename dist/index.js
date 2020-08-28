"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Midway = void 0;
const tslib_1 = require("tslib");
const server_controller_1 = require("./server-controller");
const plugin_1 = require("./plugin");
const common_utils_1 = require("./utils/common-utils");
const session_manager_1 = require("./session-manager/session-manager");
const state_manager_1 = require("./state-manager/state-manager");
const RoutesManager = require("./server-routes/midway-routes-manager");
const session_info_1 = require("./session-manager/session-info");
const repo_util_1 = require("./multiGitRepo/repo-util");
const constants_1 = require("./constants");
const index_1 = require("./smocks/index");
const Logger = require("testarmada-midway-logger");
const userRoutes = [];
const globalVariants = [];
class Midway {
    constructor() {
        this.profile = (id, profile) => index_1.default.profile(id, profile);
        this.util = common_utils_1.default;
        this.log = Logger;
        this.id = (id) => {
            if (!id || index_1.default._id) {
                return index_1.default._id;
            }
            index_1.default._id = id;
            return index_1.default;
        };
        this.start = (midwayOptions) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger.debug('***************Starting Midway mocking server ***************');
            yield repo_util_1.default.handleMultipleRepos(midwayOptions);
            midwayOptions.userRoutes = userRoutes;
            const server = yield server_controller_1.default.start(midwayOptions);
            this.server = server;
            return server;
        });
        this.stop = (server) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger.debug('***************Stopping Midway mocking server ***************');
            const serverToStop = server || this.server;
            return server_controller_1.default.stop(serverToStop);
        });
        this.toPlugin = (hapiPluginOptions, options) => {
            const smocksOptions = options || {};
            smocksOptions.userRoutes = userRoutes;
            return plugin_1.default.toPlugin(hapiPluginOptions, smocksOptions);
        };
        this.route = (data) => {
            Logger.debug('Routes.....');
            Logger.debug(JSON.stringify(data, null, 2));
            const smockRouteObject = index_1.default.route(data);
            if (repo_util_1.default.getMultiRepoDirectory()) {
                smockRouteObject.mockedDirectory = constants_1.default.MULTI_REPOS_PATH + repo_util_1.default.getMultiRepoDirectory();
            }
            RoutesManager.addGlobalVariantForSingleRoute(globalVariants, smockRouteObject);
            if (!common_utils_1.default.isServerRunning()) {
                const userRouteData = { 'routeObject': smockRouteObject, 'routeData': data };
                userRoutes.push(userRouteData);
            }
            return smockRouteObject;
        };
        this.addGlobalVariant = (data) => {
            RoutesManager.addGlobalVariant(globalVariants, userRoutes, data);
        };
        this.getRoute = (routeId) => {
            return index_1.default.routes.get(routeId);
        };
        this.setMockId = (mockId, sessionId) => {
            return common_utils_1.default.setMockId(mockId, sessionId);
        };
        this.getMockId = (sessionId) => {
            return common_utils_1.default.getMockId(sessionId);
        };
        this.resetMockId = (sessionId) => {
            return common_utils_1.default.resetMockId(sessionId);
        };
        this.resetMockVariantWithSession = common_utils_1.default.resetMockVariantWithSession;
        this.setMockVariantWithSession = common_utils_1.default.setMockVariantWithSession;
        this.setMockVariant = (options, callback) => {
            if (!options.mockPort) {
                options.mockPort = this.getPortInfo().httpPort;
            }
            common_utils_1.default.setMockVariant(options, (err, result) => {
                if (err) {
                    return callback(err);
                }
                return callback(null, result);
            });
        };
        this.resetURLCount = (sessionId) => {
            return common_utils_1.default.resetURLCount(sessionId);
        };
        this.getURLCount = (sessionId) => {
            return common_utils_1.default.getURLCount(sessionId);
        };
        this.checkSession = (sessionId) => {
            return session_manager_1.default.checkSession(sessionId);
        };
        this.getSessions = () => {
            return session_info_1.default.getSessions();
        };
        this.registerSession = () => {
            return session_manager_1.default.registerSession();
        };
        this.closeSession = (sessionId, callback) => {
            return session_manager_1.default.closeSession(sessionId, callback);
        };
        this.clearSessions = () => {
            session_manager_1.default.clearSessions();
        };
        this.getProjectName = () => {
            return common_utils_1.default.getProjectName();
        };
        this.getPortInfo = () => {
            return common_utils_1.default.getPortInfo();
        };
        this.addState = (route, stateKey, stateValue) => {
            state_manager_1.default.addState(route, stateKey, stateValue);
        };
        this.getState = (route, stateKey) => {
            return state_manager_1.default.getState(route, stateKey);
        };
        this.clearState = (sessionId) => {
            state_manager_1.default.clearState(sessionId);
        };
    }
}
exports.Midway = Midway;
exports.default = new Midway();
//# sourceMappingURL=index.js.map