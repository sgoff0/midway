declare class StateManager {
    state: {};
    addState: (route: any, stateKey: any, stateValue: any) => void;
    getState: (route: any, stateKey: any) => any;
    clearState: (sessionId: any) => void;
}
declare const _default: StateManager;
export default _default;
