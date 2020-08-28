import Route from './route-model';
import * as Hapi from '@hapi/hapi';
export interface VariantData {
    id?: string;
    handler?: (request: Hapi.Request, h: Hapi.ResponseToolkit) => Hapi.Lifecycle.ReturnValue;
    label?: string;
    input?: any;
    appliesToRoute?: any;
}
declare class Variant {
    private _id;
    private _label;
    handler: any;
    private _route;
    private _input;
    appliesToRoute: any;
    state: any;
    onActivate: any;
    constructor(data: VariantData, route: Route);
    id: () => any;
    label: (label: any) => any;
    input: (input: any) => any;
    respondWith: (handler: any) => this;
    respondWithFile: (options: any) => this;
    variant: (...args: any[]) => any;
    route: (...args: any[]) => any;
    done: () => void;
}
export default Variant;
