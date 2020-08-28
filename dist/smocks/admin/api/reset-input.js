"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require('lodash');
const format_data_1 = require("./format-data");
function default_1(mocker) {
    return function (request, h, respondWithConfig) {
        mocker.state.resetRouteState(request);
        _.each(mocker.routes.get(), function (route) {
            route.resetRouteVariant(request);
            route.resetSelectedInput(request);
        });
        return h.response(respondWithConfig ? format_data_1.default(mocker, request) : {});
    };
}
exports.default = default_1;
;
//# sourceMappingURL=reset-input.js.map