"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const format_data_1 = require("./format-data");
function default_1(mocker) {
    return function (request, reply, respondWithConfig) {
        mocker.state.routeState(request).__proxy = request.payload.config;
        reply(respondWithConfig ? format_data_1.default(mocker, request) : {});
    };
}
exports.default = default_1;
;
//# sourceMappingURL=set-proxy.js.map