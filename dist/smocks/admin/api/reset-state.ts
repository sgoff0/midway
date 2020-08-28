import formatData from './format-data';
import { Smocks } from '../..';

export default function (mocker: Smocks) {

  return function (request, reply, respondWithConfig) {
    mocker.state.resetUserState(request, JSON.parse(JSON.stringify(mocker.initOptions.initialState || {})));

    reply(respondWithConfig ? formatData(mocker, request) : {});
  };
};