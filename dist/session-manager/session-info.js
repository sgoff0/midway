"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SessionInfo {
    constructor() {
        this.midwaySessions = {};
        this.getSessions = () => {
            return this.midwaySessions;
        };
        this.setSession = (sessions) => {
            this.midwaySessions = sessions;
        };
    }
}
exports.default = new SessionInfo();
//# sourceMappingURL=session-info.js.map