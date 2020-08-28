"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const format_data_1 = require("./format-data");
function default_1(mocker) {
    return function (request, reply, respondWithConfig) {
        mocker.state.resetUserState(request, JSON.parse(JSON.stringify(mocker.initOptions.initialState || {})));
        reply(respondWithConfig ? format_data_1.default(mocker, request) : {});
    };
}
exports.default = default_1;
;
//# sourceMappingURL=reset-state.js.map