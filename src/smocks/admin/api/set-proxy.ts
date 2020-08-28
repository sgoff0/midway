import formatData from './format-data';
import { Smocks } from '../..';

export default function (mocker: Smocks) {
  return function (request, reply, respondWithConfig) {
    mocker.state.routeState(request).__proxy = request.payload.config;
    reply(respondWithConfig ? formatData(mocker, request) : {});
  };
};