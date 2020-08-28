import * as Hapi from '@hapi/hapi';
export declare class StaticState {
    doInitialize: boolean;
    ROUTE_STATE: Record<string, any>;
    USER_STATE: {};
    SESSION_VARIANT_STATE: Record<string, Record<string, string>>;
    initialize: (request: any) => boolean;
    userState: (request: any, details?: any) => {};
    resetUserState: (request: any, initialState: any) => void;
    routeState: (request: any) => Record<string, any>;
    resetRouteState: (request: any) => void;
    sessionVariantState: (request: any) => Record<string, Record<string, string>>;
    resetSessionVariantState: (request: any) => void;
    resetSessionVariantStateByKey: (request: any, key: any) => void;
    setSessionVariantStateByKey: (request: any, key: string, payload: Record<string, string>) => void;
    onResponse: (request: any, h: Hapi.ResponseToolkit) => void;
}
declare const _default: StaticState;
export default _default;
