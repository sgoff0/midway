import formatData from './format-data';
import { Smocks } from '../..';
import * as Hapi from '@hapi/hapi';

export default function (mocker: Smocks) {
  return function (request, h: Hapi.ResponseToolkit, respondWithConfig) {
    mocker.state.resetSessionVariantState(request);

    return h.response(respondWithConfig ? formatData(mocker, request) : {});
  };
};