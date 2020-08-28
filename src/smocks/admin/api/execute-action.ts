/**
* MIT License
*
* Copyright (c) 2018-present, Walmart Inc.,
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
*/
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