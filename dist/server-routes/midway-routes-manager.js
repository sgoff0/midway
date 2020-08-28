"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGlobalVariantForSingleRoute = exports.addGlobalVariant = exports.addMidwayServerAPIs = exports.addRoutesToSessions = exports.addVarinatsToSessionRoutes = void 0;
const index_1 = require("./../smocks/index");
const midway_system_routes_1 = require("./midway-system-routes");
const Logger = require("testarmada-midway-logger");
const session_manager_1 = require("./../session-manager/session-manager");
const midway_routes_info_1 = require("./midway-routes-info");
exports.addVarinatsToSessionRoutes = (currentRouteObject, smockRouteObject) => {
    for (const variant in currentRouteObject._variants) {
        const variantToSet = {
            id: undefined,
            label: undefined,
            handler: undefined,
            input: undefined
        };
        const currentVariant = currentRouteObject._variants[variant];
        if (currentVariant._id != 'default') {
            variantToSet.id = currentVariant._id;
            variantToSet.label = currentVariant._label;
            variantToSet.handler = currentVariant.handler;
            variantToSet.input = currentVariant._input;
            smockRouteObject.variant(variantToSet);
        }
    }
};
exports.addRoutesToSessions = (midwayOptions) => {
    const sessions = session_manager_1.default.addSessions(midwayOptions.sessions);
    index_1.default.addSessions(sessions);
    for (const sessionId in sessions) {
        for (let routeCount = 0; routeCount < midwayOptions.userRoutes.length; routeCount++) {
            const sessionRoute = {
                id: undefined,
                label: undefined,
                path: undefined
            };
            const currentRoute = midwayOptions.userRoutes[routeCount];
            const currentRouteData = currentRoute.routeData;
            const currentRouteObject = currentRoute.routeObject;
            Logger.debug('Current Route: [' + sessionId + ']: ' + JSON.stringify(currentRouteData, null, 2));
            Logger.debug('Current RouteObject: [' + sessionId + ']: ' + currentRouteObject);
            for (const routeInfo in currentRouteData) {
                sessionRoute[routeInfo] = currentRouteData[routeInfo];
            }
            sessionRoute.id = sessionRoute.id + '-' + sessionId;
            sessionRoute.label = sessionRoute.label + '-session-id-' + sessionId;
            sessionRoute.path = '/' + sessionId + sessionRoute.path;
            const smockRouteObject = index_1.default.route(sessionRoute);
            const sessionRouteData = { 'routeObject': smockRouteObject, 'routeData': sessionRoute };
            midway_routes_info_1.default.addSessionRoute(sessionRouteData);
            exports.addVarinatsToSessionRoutes(currentRouteObject, smockRouteObject);
        }
    }
    midway_routes_info_1.default.lockRoutes();
};
exports.addMidwayServerAPIs = () => {
    for (const route in midway_system_routes_1.default) {
        const routeId = midway_system_routes_1.default[route].id;
        const routeExists = index_1.default.findRoute(routeId);
        if (routeExists === undefined) {
            index_1.default.route(midway_system_routes_1.default[route]);
        }
    }
};
exports.addGlobalVariant = (globalVariants, userRoutes, variant) => {
    globalVariants.push(variant);
    userRoutes.forEach(function (userRouteData) {
        userRouteData.routeObject.variant(variant);
    });
};
exports.addGlobalVariantForSingleRoute = (globalVariants, smockRouteObject) => {
    globalVariants.forEach(function (globalVariant) {
        smockRouteObject.variant(globalVariant);
    });
};
//# sourceMappingURL=midway-routes-manager.js.map