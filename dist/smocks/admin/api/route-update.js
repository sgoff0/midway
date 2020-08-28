"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const format_data_1 = require("./format-data");
;
const session_manager_1 = require("./util/session-manager");
const Logger = require('testarmada-midway-logger');
const _ = require("lodash");
function default_1(route, mocker) {
    return function (request, h, respondWithConfig) {
        const payload = request.payload;
        const variantId = payload.variant;
        const input = payload.input;
        if (variantId) {
            const proxyApi = mocker.initOptions.proxyApi;
            if (proxyApi) {
                const sessionId = session_manager_1.default.getSessionId(request.path);
                const routeNoSession = session_manager_1.default.getRouteWithoutSession(route._path);
                proxyApi.setMockVariant({ mockVariant: variantId, route: routeNoSession, sessionId: sessionId }, function (err) {
                    if (err) {
                        Logger.error('Error when updating mock variant for midway proxy' + err);
                    }
                    else {
                        Logger.debug('Mock Variant for [' + sessionId + '] session and [' + request.path + '] route set to: ' + variantId + ' in proxy api');
                    }
                });
            }
        }
        Logger.warn("Address me, not fully implemented");
        const variant = selectVariant(h, route, variantId, request);
        if (input) {
            copyProperties(input, route, request);
        }
        return (respondWithConfig ? format_data_1.default(mocker, request) : {});
    };
}
exports.default = default_1;
;
function selectVariant(h, route, variantId, request) {
    const returnObj = route.selectVariant(variantId, request);
    return returnObj;
}
function copyProperties(input, route, request) {
    if (input.route) {
        _.extend(route.selectedRouteInput(request), input.route);
    }
    if (input.variant) {
        _.extend(route.selectedVariantInput(route.getActiveVariant(request), request), input.variant);
    }
}
//# sourceMappingURL=route-update.js.map