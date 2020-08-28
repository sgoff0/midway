"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger = require("testarmada-midway-logger");
const common_utils_1 = require("./../utils/common-utils");
const constants_1 = require("../constants");
class StateManager {
    constructor() {
        this.state = {};
        this.addState = (route, stateKey, stateValue) => {
            const sessionId = common_utils_1.default.getSessionId({ route: route.variant._route });
            Logger.debug('Setting stateKey and stateValue with session Id', stateKey, stateValue, sessionId);
            if (this.state[sessionId] === undefined) {
                this.state[sessionId] = {};
            }
            this.state[sessionId][stateKey] = stateValue;
        };
        this.getState = (route, stateKey) => {
            const sessionId = common_utils_1.default.getSessionId({ route: route.variant._route });
            if (this.state[sessionId] === undefined) {
                return undefined;
            }
            return this.state[sessionId][stateKey];
        };
        this.clearState = (sessionId) => {
            if (sessionId) {
                delete this.state[sessionId];
            }
            else {
                delete this.state[constants_1.default.DEFAULT_SESSION];
            }
        };
    }
}
exports.default = new StateManager();
//# sourceMappingURL=state-manager.js.map