declare class SmocksSessionManager {
    private midwaySessions;
    private DEFAULT_SESSION;
    addSessions: (sessions: any) => void;
    getRouteWithoutSession: (path: any) => any;
    getSessionId: (pathInput: any) => string;
    formatPath: (path: any) => any;
}
declare const _default: SmocksSessionManager;
export default _default;
