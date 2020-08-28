import { Smocks } from '../..';
import Route from '../../route-model';
import * as Hapi from '@hapi/hapi';
export default function (route: Route, mocker: Smocks): (request: any, h: Hapi.ResponseToolkit, respondWithConfig: any) => {};
