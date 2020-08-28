"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const format_data_1 = require("./format-data");
function default_1(mocker) {
    return function (request, h, respondWithConfig) {
        const key = request.params.key;
        mocker.state.resetSessionVariantStateByKey(request, key);
        return h.response(respondWithConfig ? format_data_1.default(mocker, request) : {});
    };
}
exports.default = default_1;
;
//# sourceMappingURL=reset-session-variant-state-by-key.js.map