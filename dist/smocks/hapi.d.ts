import * as Hapi from '@hapi/hapi';
declare const _default: {
    toPlugin: (smocksOptions?: {
        state: any;
    }) => {
        name: string;
        version: string;
        register: (server: any, options: any) => void;
    };
    start: (hapiOptions: any, smocksOptions: any) => {
        server: Hapi.Server;
        start: (options: any) => void;
    };
};
export default _default;
