"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticState = void 0;
const Logger = require("testarmada-midway-logger");
class StaticState {
    constructor() {
        this.doInitialize = true;
        this.ROUTE_STATE = {};
        this.USER_STATE = {};
        this.SESSION_VARIANT_STATE = {};
        this.initialize = (request) => {
            Logger.debug("Static State Initialize");
            const shouldInitializeNow = this.doInitialize;
            this.doInitialize = false;
            return shouldInitializeNow;
        };
        this.userState = (request, details) => {
            return this.USER_STATE;
        };
        this.resetUserState = (request, initialState) => {
            this.USER_STATE = initialState;
        };
        this.routeState = (request) => {
            return this.ROUTE_STATE;
        };
        this.resetRouteState = (request) => {
            this.ROUTE_STATE = {};
        };
        this.sessionVariantState = (request) => {
            return this.SESSION_VARIANT_STATE;
        };
        this.resetSessionVariantState = (request) => {
            this.SESSION_VARIANT_STATE = {};
        };
        this.resetSessionVariantStateByKey = (request, key) => {
            delete this.SESSION_VARIANT_STATE[key];
        };
        this.setSessionVariantStateByKey = (request, key, payload) => {
            this.SESSION_VARIANT_STATE[key] = payload;
        };
        this.onResponse = (request, h) => {
            h.state('__smocks_state', 'static', { encoding: 'none', clearInvalid: true, path: '/' });
        };
    }
}
exports.StaticState = StaticState;
exports.default = new StaticState();
//# sourceMappingURL=static-state.js.map