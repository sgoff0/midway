import Route from './route-model';
import Variant from './variant-model';
import { StaticState } from './state/static-state';
export declare class Smocks {
    _id: string;
    private _connection;
    private _routes;
    private _variants;
    private _profiles;
    private _actions;
    options: {};
    input: any;
    inputs: any;
    state: StaticState;
    routes: {
        get: (id?: any) => Route[];
    };
    variants: {
        get: (id?: any) => Variant | Variant[];
    };
    actions: {
        get: () => {};
        execute: (id: any, input: any, request: any) => boolean;
    };
    profiles: {
        applyProfile: (profile: any, request?: any) => boolean;
        get: (id?: any) => any;
    };
    initOptions: any;
    id(id?: string): string | this;
    connection(connection: any): any;
    addSessions(sessions: any): void;
    route(data: any): Route;
    method(route: any, method: any): any;
    profile(id: any, profile: any): void;
    action(id: any, options: any): this;
    execute(id: any, input: any, request: any): boolean;
    applyProfile(profile: any, request: any): boolean;
    getProfile(id: any): any;
    findRoute(id: any): Route;
    _sanitizeOptions(options: any): any;
    _sanityCheckRoutes(): void;
    _executionContext(request: any, route?: any, plugin?: any): {
        state: (id: any, value: any) => any;
        input: (id: any) => any;
        meta: (id: any) => any;
        route: any;
        variant: any;
    };
}
declare const _default: Smocks;
export default _default;
