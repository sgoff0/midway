"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger = require("testarmada-midway-logger");
const MidwayUtil = require("testarmada-midway-util");
const common_utils_1 = require("./../utils/common-utils");
const session_info_1 = require("./session-info");
const state_manager_1 = require("./../state-manager/state-manager");
const constants_1 = require("../constants");
const midway_routes_info_1 = require("../server-routes/midway-routes-info");
const sessionState = { 'available': 'AVAILABLE', 'inuse': 'IN_USE', 'invalid': 'DOES_NOT_EXISTS', 'busy': 'NOT_AVAILABLE' };
const Async = require('async');
class SessionManager {
    constructor() {
        this.midwaySessions = {};
        this.SESSION_STATE = sessionState;
        this.checkSession = (sessionId) => {
            if (sessionId in this.midwaySessions) {
                return this.midwaySessions[sessionId];
            }
            else {
                Logger.debug('No session id with value: ' + sessionId);
                return sessionState.invalid;
            }
        };
        this.addSessions = (sessionCount) => {
            for (let count = 0; count < sessionCount; count++) {
                const sessionId = MidwayUtil.generateUniqueId();
                this.midwaySessions[sessionId] = sessionState.available;
                Logger.debug('Adding session: ' + sessionId);
            }
            session_info_1.default.setSession(this.midwaySessions);
            return this.midwaySessions;
        };
        this.registerSession = () => {
            for (const sessionId in this.midwaySessions) {
                if (this.midwaySessions[sessionId] == sessionState.available) {
                    Logger.info('Registering session: ' + sessionId);
                    this.midwaySessions[sessionId] = sessionState.inuse;
                    return sessionId;
                }
            }
            Logger.info('No Sessions are available');
            return sessionState.busy;
        };
        this.closeSession = (sessionId, callback) => {
            if (sessionId in this.midwaySessions) {
                if (this.midwaySessions[sessionId] !== sessionState.available) {
                    Logger.info('Closing session: ' + sessionId);
                    common_utils_1.default.resetMockId(sessionId);
                    common_utils_1.default.resetURLCount(sessionId);
                    state_manager_1.default.clearState(sessionId);
                    const sessionRoutes = midway_routes_info_1.default.getUserRoutesForSession(sessionId);
                    const nonDefaultVariantRoutes = [];
                    for (const route in sessionRoutes) {
                        if (sessionRoutes[route]._activeVariant !== 'default') {
                            nonDefaultVariantRoutes.push(sessionRoutes[route]._id);
                        }
                    }
                    const setMockVariantIterator = function (routeId, next) {
                        const setVariantOptions = {};
                        setVariantOptions[constants_1.default.MOCK_PORT] = common_utils_1.default.getPortInfo()[constants_1.default.HTTP_PORT];
                        setVariantOptions[constants_1.default.VARIANT] = constants_1.default.DEFAULT_VARIANT;
                        setVariantOptions[constants_1.default.FIXTURE] = routeId;
                        Logger.debug('Setting default variant for route: ', routeId);
                        common_utils_1.default.setMockVariant(setVariantOptions, function (err) {
                            Logger.debug('Post call done for Set mock variant: ', setVariantOptions);
                            if (err) {
                                Logger.debug(err);
                                return next(err);
                            }
                            next();
                        });
                    };
                    const afterAsyncCallBack = function (err) {
                        if (err) {
                            return callback(err);
                        }
                        Logger.debug('Calling final callback after setting all routes variants to default for sessionId: ' + sessionId);
                        this.midwaySessions[sessionId] = sessionState.available;
                        return callback(sessionState.available);
                    };
                    Logger.info('Setting variants to default for all routes for sessionId:', sessionId);
                    Async.each(nonDefaultVariantRoutes, setMockVariantIterator, afterAsyncCallBack);
                }
                else {
                    Logger.debug('Session id : ' + sessionId + ' is already available');
                    return callback(sessionState.available);
                }
            }
            else {
                Logger.debug('No session id with value: ' + sessionId);
                return callback(sessionState.invalid);
            }
        };
        this.clearSessions = () => {
            this.midwaySessions = {};
        };
    }
}
;
exports.default = new SessionManager();
//# sourceMappingURL=session-manager.js.map