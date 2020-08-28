"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const format_data_1 = require("./format-data");
function default_1(mocker) {
    return function (request, reply, respondWithConfig) {
        const profile = request.payload;
        const selected = mocker.profiles.applyProfile(profile, request);
        if (!selected) {
            return reply().code(404);
        }
        reply(respondWithConfig ? format_data_1.default(mocker, request) : {});
    };
}
exports.default = default_1;
;
//# sourceMappingURL=select-local-profile.js.map