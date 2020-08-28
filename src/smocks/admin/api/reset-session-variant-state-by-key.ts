import formatData from './format-data';
import { Smocks } from '../..';

export default function (mocker: Smocks) {
  return function (request, reply, respondWithConfig) {
    const key = request.params.key;
    mocker.state.resetSessionVariantStateByKey(request, key);

    reply(respondWithConfig ? formatData(mocker, request) : {});
  };
};