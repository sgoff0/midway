import formatData from './format-data';
import { Smocks } from '../..';
import * as Hapi from '@hapi/hapi';

export default function (mocker: Smocks) {
  return function (request, h: Hapi.ResponseToolkit, respondWithConfig) {
    const key = request.params.key;
    mocker.state.resetSessionVariantStateByKey(request, key);

    return h.response(respondWithConfig ? formatData(mocker, request) : {});
  };
};