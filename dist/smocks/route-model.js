"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const Logger = require('testarmada-midway-logger');
const variant_model_1 = require("./variant-model");
class Route {
    constructor(data, mocker) {
        this.actions = {
            get: () => {
                return this._actions;
            },
            execute: (id, input, request) => {
                const action = this._actions[id];
                if (!action) {
                    return null;
                }
                else {
                    return action.handler.call(executionContext(self, request), input);
                }
            }
        };
        this.id = () => {
            return this._id;
        };
        this.method = () => {
            return this._method;
        };
        this.group = () => {
            return this._group;
        };
        this.path = () => {
            return this._path;
        };
        this.action = (id, options) => {
            if (!options) {
                options = id;
                id = options.id;
            }
            else {
                options.id = id;
            }
            this._actions[id] = options;
            return this;
        };
        this.display = (displayFunc) => {
            if (!displayFunc) {
                return this._display;
            }
            else {
                this._display = displayFunc;
                return this;
            }
        };
        this.getDisplayValue = (request) => {
            if (this._display) {
                return this._display.call(executionContext(this, request));
            }
        };
        this.label = (label) => {
            if (!label) {
                return this._label;
            }
            this._label = label;
            return label;
        };
        this.applyProfile = (profile, request) => {
            this.resetRouteVariant(request);
            this.resetSelectedInput(request);
            this.selectVariant(profile.activeVariant, request);
            const routeInput = this.selectedRouteInput(request);
            const selectedRouteInput = this.selectedRouteInput(request);
            _.extend(selectedRouteInput, profile.selections && profile.selections.route);
            _.each(this.variants(), (variant) => {
                const selectedVariantInput = this.selectedVariantInput(variant, request);
                const selections = profile.selections && profile.selections.variants && profile.selections.variants[variant.id()];
                if (selections) {
                    _.extend(selectedVariantInput, selections);
                }
            });
        };
        this.variant = (data) => {
            const variant = new variant_model_1.default(data, this);
            this._variants[variant.id()] = variant;
            this._orderedVariants.push(variant);
            if (!this._hasVariants) {
                this._hasVariants = true;
            }
            return variant;
        };
        this.variants = () => {
            const rtn = [];
            const index = {};
            _.each(this._orderedVariants, (variant) => {
                rtn.push(variant);
                index[variant.id()] = true;
            });
            _.each(this._mocker.variants.get(), (variant) => {
                if (!index[variant.id()]) {
                    if (!variant.appliesToRoute || variant.appliesToRoute(this)) {
                        rtn.push(variant);
                    }
                }
            });
            return rtn;
        };
        this.getVariant = (id) => {
            const rtn = this._variants[id];
            if (rtn) {
                return rtn;
            }
            return this._mocker.variants.get(id);
        };
        this.selectVariant = (id, request) => {
            let match = false;
            _.each(this._variants, (variant) => {
                if (variant.id() === id) {
                    match = true;
                    variant.onActivate && variant.onActivate.call(executionContext(this, request));
                }
            });
            if (!match) {
                _.each(this._mocker.variants.get(), (variant) => {
                    if (variant.id() === id) {
                        match = true;
                        variant.onActivate && variant.onActivate.call(executionContext(this, request), this);
                    }
                });
            }
            if (match) {
                this._mocker.state.routeState(request)[this._id]._activeVariant = id;
                this._activeVariant = id;
            }
            else {
                return new Error("no variants found with id : " + id);
            }
            return undefined;
        };
        this.getActiveVariant = (request) => {
            const id = this.activeVariant(request);
            return _.find(this.variants(), (variant) => {
                return variant.id() === id;
            });
        };
        this.hasVariants = () => {
            return this._hasVariants;
        };
        this.respondWith = (responder) => {
            const variant = this.variant({ id: 'default' });
            return variant.respondWith(responder);
        };
        this.respondWithFile = (options) => {
            const variant = this.variant({ id: 'default' });
            return variant.respondWithFile(options);
        };
        this.activeVariant = (request) => {
            const variantFromRequestHeader = request.headers['x-request-variant'];
            const variantFromRouteState = this._mocker.state.routeState(request)[this._id]._activeVariant;
            const sessionFromRequestHeader = request.headers["x-request-session"];
            let variantFromSession;
            if (sessionFromRequestHeader) {
                const sessionVariantState = this._mocker.state.sessionVariantState(request)[sessionFromRequestHeader];
                variantFromSession = sessionVariantState ? sessionVariantState[this._id] : undefined;
            }
            return variantFromRequestHeader || variantFromSession || variantFromRouteState;
        };
        this.done = () => {
            return this._mocker;
        };
        this.input = (input) => {
            if (input) {
                this._input = input;
                return this;
            }
            else {
                return this._input;
            }
        };
        this.config = (config) => {
            if (config) {
                this._config = config;
                return this;
            }
            else {
                return this._config;
            }
        };
        this.meta = (meta) => {
            if (meta) {
                this._meta = meta;
                return this;
            }
            else {
                return this._meta;
            }
        };
        this.resetRouteVariant = (request) => {
            const routeState = this._mocker.state.routeState(request)[this.id()] = {};
            const variants = this.variants();
            for (let i = 0; i < variants.length; i++) {
                routeState._activeVariant = variants[i].id();
                this._activeVariant = variants[i].id();
                break;
            }
        };
        this.resetSelectedInput = (request) => {
            Logger.debug("Reset Selected Input");
            let rootInput = this._mocker.state.routeState(request)[this.id()];
            if (!rootInput) {
                this._mocker.state.routeState(request)[this.id()] = {};
                rootInput = this._mocker.state.routeState(request)[this.id()];
            }
            const selectedRouteInput = rootInput._input = {};
            rootInput._variantInput = {};
            const route = this;
            function setDefaultValue(key, data, obj) {
                const value = _.isFunction(data.defaultValue) ? data.defaultValue.call(executionContext(route, request)) : data.defaultValue;
                if (value !== undefined) {
                    obj[key] = value;
                }
            }
            _.each(this.input(), (data, key) => {
                setDefaultValue(key, data, selectedRouteInput);
            });
            _.each(this.variants(), (variant) => {
                route.selectVariantInput({}, variant, request);
                const selectedVariantInput = route.selectedVariantInput(variant, request);
                _.each(variant.input(), (data, key) => {
                    setDefaultValue(key, data, selectedVariantInput);
                });
            });
        };
        this.selectRouteInput = (selectedInput, request) => {
            const input = this._mocker.state.routeState(request);
            input[this.id()]._input = selectedInput || {};
            return this;
        };
        this.selectedRouteInput = (request) => {
            const input = this._mocker.state.routeState(request);
            return input[this.id()]._input;
        };
        this.getInputValue = (id, request) => {
            const routeInput = this.selectedRouteInput(request);
            if (!_.isUndefined(routeInput[id])) {
                return routeInput[id];
            }
            const variant = this.getActiveVariant(request);
            const variantInput = this.selectedVariantInput(variant, request);
            return variantInput[id];
        };
        this.selectedVariantInput = (variant, request) => {
            const smocksState = this._mocker.state;
            Logger.warn("Routes not yet loaded from file, make sure they are being read then this may work");
            const smocksRouteState = smocksState.routeState(request);
            const routeIdState = smocksRouteState[this._id];
            let input = routeIdState === null || routeIdState === void 0 ? void 0 : routeIdState._variantInput;
            if (!input) {
                input = this._mocker.state.routeState(request)[this.id()]._variantInput = {};
            }
            input = input[variant.id()];
            if (!input) {
                input = input[variant.id()] = {};
            }
            return input;
        };
        this.selectVariantInput = (selectedInput, variant, request) => {
            const routeState = this._mocker.state.routeState(request);
            const id = this.id();
            const routeStateForId = routeState[id];
            const variantInput = routeStateForId === null || routeStateForId === void 0 ? void 0 : routeStateForId._variantInput;
            const input = this._mocker.state.routeState(request)[this.id()];
            input._variantInput[variant.id()] = selectedInput;
        };
        this.getMetaValue = (id) => {
            return this._meta && this._meta[id];
        };
        this._handleRequest = (request, h) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const mocker = this._mocker;
            const variant = this.getActiveVariant(request);
            if (variant) {
                if (variant.handler) {
                    const context = executionContext(this, request);
                    return yield variant.handler.call(context, request, h);
                }
                else {
                    Logger.error('no variant handler found for ' + this._path + ':' + variant.id());
                    return h.response('no variant handler found for ' + this._path + ':' + variant.id()).code(500);
                }
            }
            else {
                Logger.error('no selected handler found for ' + this._path);
                return h.response('no selected handler found for ' + this.path).code(500);
            }
        });
        this.route = (data) => {
            return this._mocker.route(data);
        };
        this._mocker = mocker;
        this._label = data.label;
        this._path = data.path;
        this._method = data.method || 'GET';
        this._group = data.group;
        this._id = data.id || this._method + ':' + this._path;
        this._config = data.config;
        this._input = data.input;
        this._meta = data.meta;
        this._variants = {};
        this._orderedVariants = [];
        this._actions = data.actions || {};
        this._display = data.display;
        this._activeVariant = 'default';
        if (data.handler) {
            this.variant({
                id: 'default',
                label: data.variantLabel,
                handler: data.handler
            });
        }
        if (data.actions) {
            this._actions = data.actions;
        }
    }
}
exports.default = Route;
function executionContext(route, request) {
    const variant = route.getActiveVariant(request);
    return {
        state: function (id, value) {
            const details = {
                route: route,
                variant: variant
            };
            if (value !== undefined) {
                route._mocker.state.userState(request, details)[id] = value;
            }
            else {
                return route._mocker.state.userState(request, details)[id];
            }
        },
        input: function (id) {
            return route.getInputValue(id, request);
        },
        meta: function (id) {
            return route.getMetaValue(id);
        },
        route: route,
        variant: variant
    };
}
//# sourceMappingURL=route-model.js.map