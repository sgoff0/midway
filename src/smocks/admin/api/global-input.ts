import formatData from './format-data';
import { Smocks } from '../..';

export default function (mocker: Smocks) {

  return function (request, reply, respondWithConfig) {
    const pluginId = request.params.pluginId;
    const id = request.payload.id;
    const value = request.payload.value;

    mocker.plugins.updateInput(pluginId, id, value, request);

    reply(respondWithConfig ? formatData(mocker, request) : {});
  };
};