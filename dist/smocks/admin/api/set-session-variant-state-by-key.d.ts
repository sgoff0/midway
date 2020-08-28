import { Smocks } from '../..';
import * as Hapi from '@hapi/hapi';
export default function (mocker: Smocks): (request: any, h: Hapi.ResponseToolkit, respondWithConfig: any) => Hapi.ResponseObject;
