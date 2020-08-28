"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SmocksSessionManager {
    constructor() {
        this.midwaySessions = {};
        this.DEFAULT_SESSION = 'default';
        this.addSessions = (sessions) => {
            this.midwaySessions = sessions;
        };
        this.getRouteWithoutSession = (path) => {
            const formattedPath = this.formatPath(path);
            for (const session in this.midwaySessions) {
                const regex = new RegExp('^\\/' + session, 'i');
                if (regex.test(formattedPath)) {
                    path = formattedPath.replace('/' + session, "");
                    return path;
                }
            }
            return path;
        };
        this.getSessionId = (pathInput) => {
            const path = this.formatPath(pathInput);
            for (const session in this.midwaySessions) {
                const regex = new RegExp('^\\/' + session, 'i');
                const dashRegex = new RegExp('^\\/.+-' + session, 'i');
                if (regex.test(path) || dashRegex.test(path)) {
                    return session;
                }
            }
            return this.DEFAULT_SESSION;
        };
        this.formatPath = (path) => {
            return path.replace(/[{}}]\.*/g, '');
        };
    }
}
exports.default = new SmocksSessionManager();
//# sourceMappingURL=session-manager.js.map