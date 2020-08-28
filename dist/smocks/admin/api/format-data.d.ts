import { Smocks } from '../..';
import * as Hapi from '@hapi/hapi';
declare function formatData(mocker: Smocks, request: Hapi.Request): {
    id: string | Smocks;
    routes: {
        id: any;
        path: string;
        group: any;
        method: string;
        label: any;
        display: any;
        variants: {
            id: any;
            label: any;
            input: {};
        }[];
        actions: any[];
        input: {};
        selections: any;
        activeVariant: any;
    }[];
    profiles: any[];
    actions: any[];
};
export default formatData;
