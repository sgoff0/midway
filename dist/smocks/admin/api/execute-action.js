"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require('lodash');
const Logger = require('testarmada-midway-logger');
const format_data_1 = require("./format-data");
;
function default_1(mocker) {
    return function (request, reply, respondWithConfig) {
        const actionId = request.payload.action;
        const routeId = request.payload.route;
        const config = request.payload.config;
        let executer;
        if (!routeId) {
            executer = function () {
                return mocker.actions.execute(actionId, config, request);
            };
        }
        else {
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
                reply('no action found').code(404);
            }
            else {
                const rtn = respondWithConfig ? format_data_1.default(mocker, request) : {};
                rtn._actionResponse = actionResponse;
                reply(rtn);
            }
        }
        catch (e) {
            const message = _.isString(e) ? e : e.message + '\n' + e.stack;
            Logger.error(message);
            reply(message).code(500);
        }
    };
}
exports.default = default_1;
;
//# sourceMappingURL=execute-action.js.map