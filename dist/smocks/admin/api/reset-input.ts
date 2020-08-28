const _ = require('lodash');
import formatData from './format-data';
import { Smocks } from '../..';
import * as Hapi from '@hapi/hapi';

export default function (mocker: Smocks) {

  return function (request, h: Hapi.ResponseToolkit, respondWithConfig) {
    mocker.state.resetRouteState(request);

    _.each(mocker.routes.get(), function (route) {
      route.resetRouteVariant(request);
      route.resetSelectedInput(request);
    });
    // mocker.plugins.resetInput(request);

    return h.response(respondWithConfig ? formatData(mocker, request) : {});
  };
};