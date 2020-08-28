import formatData from './format-data';
import { Smocks } from '../..';
import * as Hapi from '@hapi/hapi';

export default function (mocker: Smocks) {
  return function (request, h: Hapi.ResponseToolkit, respondWithConfig) {
    const key: string = request.params.key;
    const payload: Record<string, string> = request.payload;
    mocker.state.setSessionVariantStateByKey(request, key, payload);

    return h.response(respondWithConfig ? formatData(mocker, request) : {});
  };
};