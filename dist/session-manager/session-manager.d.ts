declare class SessionManager {
    private midwaySessions;
    SESSION_STATE: {
        available: string;
        inuse: string;
        invalid: string;
        busy: string;
    };
    checkSession: (sessionId: any) => any;
    addSessions: (sessionCount: any) => {};
    registerSession: () => string;
    closeSession: (sessionId: any, callback: any) => any;
    clearSessions: () => void;
}
declare const _default: SessionManager;
export default _default;
