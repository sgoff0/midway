import formatData from './format-data';
import { Smocks } from '../..';

export default function (mocker: Smocks) {
  return function (request, reply, respondWithConfig) {
    const key = request.params.key;
    const payload = request.payload;
    mocker.state.setSessionVariantStateByKey(request, key, payload);

    reply(respondWithConfig ? formatData(mocker, request) : {});
  };
};