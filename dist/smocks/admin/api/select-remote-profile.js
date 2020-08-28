"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const format_data_1 = require("./format-data");
function default_1(mocker) {
    return function (request, reply, respondWithConfig) {
        const id = request.params.name;
        const selected = mocker.profiles.applyProfile(id);
        if (!selected) {
            reply().code(404);
        }
        reply(respondWithConfig ? format_data_1.default(mocker, request) : {});
    };
}
exports.default = default_1;
;
//# sourceMappingURL=select-remote-profile.js.map