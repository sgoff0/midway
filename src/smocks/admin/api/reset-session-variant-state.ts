import formatData from './format-data';
import { Smocks } from '../..';

export default function (mocker: Smocks) {
  return function (request, reply, respondWithConfig) {
    mocker.state.resetSessionVariantState(request);

    reply(respondWithConfig ? formatData(mocker, request) : {});
  };
};