const _ = require('lodash');
const Logger = require('testarmada-midway-logger');
import formatData from './format-data';;
import * as Hapi from '@hapi/hapi';
import { Smocks } from '../..';
import Route from '../../route-model';

// type RouteOrRoutes = Route | Route[];

// function determineIfIsAnimalOrHuman(toBeDetermined: RouteOrRoutes): Route {
//   if (toBeDetermined as Route) {
//     return toBeDetermined;
//   }
//   return toBeDetermined[0];
// }
// function isSingleRoute(routeOrRoutes: RouteOrRoutes): routeOrRoutes is Route {
//   if ((routeOrRoutes as Route).type) {
//     return true;
//   }
//   return false;
// }

export default function (mocker: Smocks) {

  return function (request, h: Hapi.ResponseToolkit, respondWithConfig) {
    const actionId = request.payload.action;
    const routeId = request.payload.route;
    const config = request.payload.config;

    let executer;
    if (!routeId) {
      executer = function () {
        return mocker.actions.execute(actionId, config, request);
      };
    } else {
      executer = function () {
        const route = mocker.routes.get(routeId) as Route;
        if (route) {
          return route.actions.execute(actionId, config, request);
        }
      };
    }

    try {
      const actionResponse = executer();
      if (_.isNull(actionResponse)) {
        // no action found
        return h.response('no action found').code(404);
      } else {
        const rtn: any = respondWithConfig ? formatData(mocker, request) : {};
        rtn._actionResponse = actionResponse;
        return h.response(rtn);
      }
    } catch (e) {
      const message = _.isString(e) ? e : e.message + '\n' + e.stack;
      Logger.error(message);
      return h.response(message).code(500);
    }

  };
};