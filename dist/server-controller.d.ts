import * as Hapi from '@hapi/hapi';
import { MidwayOptions } from './types/MidwayOptions';
declare class ServerController {
    start: (midwayOptions: MidwayOptions) => Promise<Hapi.Server>;
    stop: (server: Hapi.Server) => Promise<void>;
    addServerRoutesAndSessions: (midwayOptions: MidwayOptions) => void;
}
declare const _default: ServerController;
export default _default;
