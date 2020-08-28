import formatData from './format-data';;
import sessionManager from './util/session-manager';
const Logger = require('testarmada-midway-logger');
import * as _ from 'lodash';
import { Smocks } from '../..';
import Route from '../../route-model';
import * as Hapi from '@hapi/hapi';

export default function (route: Route, mocker: Smocks) {

  return function (request, h: Hapi.ResponseToolkit, respondWithConfig) {
    const payload = request.payload;
    const variantId = payload.variant;
    const input = payload.input;

    if (variantId) {
      const proxyApi = mocker.initOptions.proxyApi;
      if (proxyApi) {
        const sessionId = sessionManager.getSessionId(request.path);
        const routeNoSession = sessionManager.getRouteWithoutSession(route._path);
        proxyApi.setMockVariant({ mockVariant: variantId, route: routeNoSession, sessionId: sessionId }, function (err) {
          if (err) {
            Logger.error('Error when updating mock variant for midway proxy' + err);
          } else {
            Logger.debug('Mock Variant for [' + sessionId + '] session and [' + request.path + '] route set to: ' + variantId + ' in proxy api');
          }
        });
      }
    }
    Logger.warn("Address me, not fully implemented");
    const variant = selectVariant(h, route, variantId, request);
    if (input) {
      copyProperties(input, route, request);
    }
    return (respondWithConfig ? formatData(mocker, request) : {});
  };
};

function selectVariant(h: Hapi.ResponseToolkit, route, variantId, request) {
  const returnObj = route.selectVariant(variantId, request);
  return returnObj;
  // if (returnObj) {
  //   reply(returnObj);
  // }
}

function copyProperties(input, route, request) {
  if (input.route) {
    _.extend(route.selectedRouteInput(request), input.route);
  }
  if (input.variant) {
    _.extend(route.selectedVariantInput(route.getActiveVariant(request), request), input.variant);
  }
}