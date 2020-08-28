"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Smocks = void 0;
const _ = require("lodash");
const Logger = require('testarmada-midway-logger');
const route_model_1 = require("./route-model");
const session_manager_1 = require("./admin/api/util/session-manager");
const static_state_1 = require("./state/static-state");
class Smocks {
    constructor() {
        this._routes = [];
        this._variants = {};
        this._profiles = {};
        this._actions = {};
        this.options = {};
        this.input = undefined;
        this.inputs = undefined;
        this.state = static_state_1.default;
        this.routes = {
            get: (id) => {
                if (!id) {
                    return this._routes;
                }
                return _.filter(this._routes, route => route._id === id);
            }
        };
        this.variants = {
            get: (id) => {
                if (!id) {
                    return _.map(this._variants, (variant) => { return variant; });
                }
                return this._variants[id];
            }
        };
        this.actions = {
            get: () => {
                return this._actions;
            },
            execute: (id, input, request) => {
                const action = this._actions[id];
                if (!action) {
                    return false;
                }
                else {
                    action.handler.call(this._executionContext(request), input);
                    return true;
                }
            }
        };
        this.profiles = {
            applyProfile: (profile, request) => {
                if (_.isString(profile)) {
                    profile = this._profiles[profile];
                }
                if (profile) {
                    this.state.resetRouteState(request);
                    _.each(this._routes, (route) => {
                        route.applyProfile((route._id && profile[route._id]) || {}, request);
                    });
                    return true;
                }
                else {
                    return false;
                }
            },
            get: (id) => {
                if (!id) {
                    return this._profiles;
                }
                return this._profiles[id];
            }
        };
        this.initOptions = undefined;
    }
    id(id) {
        if (!id) {
            return this._id;
        }
        this._id = id;
        return this;
    }
    connection(connection) {
        if (connection) {
            this._connection = connection;
        }
        return this._connection;
    }
    addSessions(sessions) {
        if (sessions) {
            session_manager_1.default.addSessions(sessions);
        }
    }
    route(data) {
        if (!data.path) {
            throw new Error('Routes must be in the form of {path: "...", method: "..."}');
        }
        else {
            const route = new route_model_1.default(data, this);
            this._routes.push(route);
            return route;
        }
    }
    method(route, method) {
        if (route.hasVariants()) {
            const _route = this.route({ path: route.path });
            _route._method = method;
            return _route;
        }
        else {
            route._method = method;
            return route;
        }
    }
    profile(id, profile) {
        this._profiles[id] = profile;
    }
    action(id, options) {
        if (!options) {
            options = id;
            id = options.id;
        }
        else {
            options.id = id;
        }
        this._actions[id] = options;
        return this;
    }
    execute(id, input, request) {
        const action = this._actions[id];
        if (!action) {
            return false;
        }
        else {
            action.handler.call(this._executionContext(request), input);
            return true;
        }
    }
    applyProfile(profile, request) {
        Logger.warn("Current profiles: ", this._profiles);
        if (_.isString(profile)) {
            profile = this._profiles[profile];
        }
        if (profile) {
            this.state.resetRouteState(request);
            _.each(this._routes, (route) => {
                route.applyProfile((route._id && profile[route._id]) || {}, request);
            });
            return true;
        }
        else {
            return false;
        }
    }
    getProfile(id) {
        if (!id) {
            return this._profiles;
        }
        return this._profiles[id];
    }
    findRoute(id) {
        return _.find(this._routes, (route) => {
            return route._id === id;
        });
    }
    _sanitizeOptions(options) {
        options = _.clone(options || {});
        options.state = static_state_1.default;
        return options;
    }
    _sanityCheckRoutes() {
        const routeIndex = {};
        _.each(this._routes, (route) => {
            let id = route.id();
            if (routeIndex[id]) {
                Logger.error('duplicate route key "' + id + '"');
                process.exit(1);
            }
            else {
                routeIndex[id] = true;
            }
            const variants = route.variants();
            const variantIndex = {};
            _.each(variants, (variant) => {
                id = variant.id();
                if (variantIndex[id]) {
                    Logger.error('duplicate variant key "' + id + '" for route "' + route.id() + '"');
                    process.exit(1);
                }
                else {
                    variantIndex[id] = true;
                }
            });
        });
    }
    _executionContext(request, route, plugin) {
        const variant = route.getActiveVariant(request);
        const details = {
            route: route,
            variant: variant
        };
        return {
            state: (id, value) => {
                if (value !== undefined) {
                    this.state.userState(request, details)[id] = value;
                }
                else {
                    return this.state.userState(request, details)[id];
                }
            },
            input: (id) => {
                return route && route.getInputValue(id, request);
            },
            meta: (id) => {
                return route && route.getMetaValue(id);
            },
            route: route,
            variant: variant
        };
    }
}
exports.Smocks = Smocks;
exports.default = new Smocks();
//# sourceMappingURL=index.js.map