const _ = require('lodash');
import formatData from './format-data';
import { Smocks } from '../..';

export default function (mocker: Smocks) {

  return function (request, reply, respondWithConfig) {
    mocker.state.resetRouteState(request);

    _.each(mocker.routes.get(), function (route) {
      route.resetRouteVariant(request);
      route.resetSelectedInput(request);
    });
    mocker.plugins.resetInput(request);

    reply(respondWithConfig ? formatData(mocker, request) : {});
  };
};