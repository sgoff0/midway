import formatData from './format-data';
import { Smocks } from '../..';

export default function (mocker: Smocks) {

  return function (request, reply, respondWithConfig) {
    const id = request.params.name;
    const selected = mocker.profiles.applyProfile(id);
    if (!selected) {
      reply().code(404);
    }

    reply(respondWithConfig ? formatData(mocker, request) : {});
  };
};