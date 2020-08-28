"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const format_data_1 = require("./format-data");
function default_1(mocker) {
    return function (request, reply, respondWithConfig) {
        const pluginId = request.params.pluginId;
        const id = request.payload.id;
        const value = request.payload.value;
        reply(respondWithConfig ? format_data_1.default(mocker, request) : {});
    };
}
exports.default = default_1;
;
//# sourceMappingURL=global-input.js.map