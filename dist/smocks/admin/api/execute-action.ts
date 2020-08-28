const _ = require('lodash');
const Logger = require('testarmada-midway-logger');
import formatData from './format-data';;

export default function (mocker) {

  return function (request, reply, respondWithConfig) {
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
        const route = mocker.routes.get(routeId);
        if (route) {
          return route.actions.execute(actionId, config, request);
        }
      };
    }

    try {
      const actionResponse = executer();
      if (_.isNull(actionResponse)) {
        // no action found
        reply('no action found').code(404);
      } else {
        const rtn: any = respondWithConfig ? formatData(mocker, request) : {};
        rtn._actionResponse = actionResponse;
        reply(rtn);
      }
    } catch (e) {
      const message = _.isString(e) ? e : e.message + '\n' + e.stack;
      Logger.error(message);
      reply(message).code(500);
    }

  };
};