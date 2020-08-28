import * as Hapi from '@hapi/hapi';
import Route from '../smocks/route-model';
import Variant from '../smocks/variant-model';
export interface FileHandlerInput {
    options: FileHandlerOptions;
    h: Hapi.ResponseToolkit;
    route: Route;
    variant: Variant;
}
export interface FileHandlerOptions {
    code: number;
    headers?: Record<string, string>;
    filePath?: string;
    delay?: number;
    cookies?: any;
}
declare const _default: (mockDirectoryPath: string) => (data: FileHandlerInput) => Promise<any>;
export default _default;
