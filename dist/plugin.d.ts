import { MidwayOptions } from './types/MidwayOptions';
declare const _default: {
    toPlugin: (hapiPluginOptions: any, midwayOptions: MidwayOptions) => {
        name: string;
        version: string;
        register: (server: any, options: any) => void;
    };
};
export default _default;
