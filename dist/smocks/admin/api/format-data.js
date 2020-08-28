"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
function formatData(mocker, request) {
    return {
        id: mocker.id(),
        routes: formatRoutes(mocker, request),
        profiles: formatProfiles(mocker),
        actions: formatActions(mocker.actions.get()),
    };
}
function formatProfiles(mocker) {
    const rtn = [];
    const profiles = mocker.profiles.get();
    _.each(profiles, function (data, id) {
        rtn.push(id);
    });
    return rtn;
}
function formatRoutes(mocker, request) {
    const routes = mocker.routes.get();
    return _.compact(_.map(routes, function (route) {
        if (!route.hasVariants()) {
            return undefined;
        }
        return {
            id: route.id(),
            path: route.path(),
            group: route.group(),
            method: route.method(),
            label: route.label(),
            display: route.getDisplayValue(request),
            variants: formatVariants(route),
            actions: formatActions(route.actions.get()),
            input: formatInput(route.input()),
            selections: formatSelections(route, request),
            activeVariant: route.activeVariant(request)
        };
    }));
}
function formatSelections(route, request) {
    const variantSelections = {};
    _.each(route.variants(), function (variant) {
        const input = route.selectedVariantInput(variant, request);
        if (!isEmptyObject(input)) {
            variantSelections[variant.id()] = input;
        }
    });
    const rtn = {};
    const input = route.selectedRouteInput(request);
    if (!isEmptyObject(input)) {
        rtn.route = input;
    }
    if (!isEmptyObject(variantSelections)) {
        rtn.variants = variantSelections;
    }
    if (!isEmptyObject(rtn)) {
        return rtn;
    }
}
function formatActions(actions) {
    const rtn = [];
    _.each(actions, function (action, id) {
        rtn.push({
            id: id,
            label: action.label,
            input: formatInput(action.input)
        });
    });
    return rtn;
}
function formatVariants(route) {
    return _.map(route.variants(), function (variant) {
        return {
            id: variant.id(),
            label: variant.label(),
            input: formatInput(variant.input())
        };
    });
}
function formatInput(input) {
    const rtn = {};
    _.each(input, function (data, key) {
        rtn[key] = _.clone(data);
        rtn[key].id = key;
    });
    return rtn;
}
function isEmptyObject(obj) {
    for (const name in obj) {
        if (obj.hasOwnProperty(name)) {
            return false;
        }
    }
    return true;
}
exports.default = formatData;
//# sourceMappingURL=format-data.js.map