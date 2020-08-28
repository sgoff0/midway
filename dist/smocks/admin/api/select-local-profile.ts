import formatData from './format-data';
import { Smocks } from '../..';

export default function (mocker: Smocks) {

  return function (request, reply, respondWithConfig) {
    const profile = request.payload;
    const selected = mocker.profiles.applyProfile(profile, request);
    if (!selected) {
      return reply().code(404);
    }

    reply(respondWithConfig ? formatData(mocker, request) : {});
  };
};