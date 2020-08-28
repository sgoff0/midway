"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const format_data_1 = require("./api/format-data");
const constants_1 = require("../constants");
const route_update_1 = require("./api/route-update");
const execute_action_1 = require("./api/execute-action");
const reset_state_1 = require("./api/reset-state");
const reset_input_1 = require("./api/reset-input");
const reset_session_variant_state_1 = require("./api/reset-session-variant-state");
const reset_session_variant_state_by_key_1 = require("./api/reset-session-variant-state-by-key");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const util = require("util");
const set_session_variant_state_by_key_1 = require("./api/set-session-variant-state-by-key");
const readFile = util.promisify(fs.readFile);
const Logger = require('testarmada-midway-logger');
const MIME_TYPES = {
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.ttf': 'font/ttf',
    '.eot': 'font/eot',
    '.otf': 'font/otf',
    '.woff': 'font/woff'
};
exports.default = (server, smocks) => {
    function ensureInitialized(func) {
        return function (request, h) {
            Logger.debug("Ensure initialized");
            function doInit() {
                Logger.debug("doInit Admin");
                _.each(smocks.routes.get(), function (route) {
                    route.resetRouteVariant(request);
                    route.resetSelectedInput(request);
                });
                const initialState = JSON.parse(JSON.stringify(smocks.initOptions.initialState || {}));
                smocks.state.resetUserState(request, initialState);
            }
            const shouldPerformInitialization = smocks.state.initialize(request);
            if (shouldPerformInitialization) {
                doInit();
            }
            const returnConfig = request.query.returnConfig;
            return func.call(this, request, h, !!returnConfig);
        };
    }
    server.route({
        method: 'GET',
        path: '/_admin',
        handler: ensureInitialized(function (request, h) {
            Logger.info('Received /admin request. Redirecting to /midway');
            return h.redirect('/midway');
        })
    });
    server.route({
        method: 'GET',
        path: '/midway',
        handler: ensureInitialized((request, h) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            try {
                const html = yield readFile(__dirname + '/config-page.html', { encoding: 'utf8' });
                const data = format_data_1.default(smocks, request);
                const retVal = html.replace('{data}', JSON.stringify(data));
                return retVal;
                ;
            }
            catch (err) {
                console.error("Err: ", err);
                return h.response().code(500);
            }
        }))
    });
    server.route({
        method: 'GET',
        path: '/midway-data',
        handler: ensureInitialized((request, h) => {
            try {
                const data = format_data_1.default(smocks, request);
                return data;
            }
            catch (err) {
                Logger.error(err);
                return err;
            }
        })
    });
    server.route({
        method: 'POST',
        path: constants_1.MIDWAY_API_PATH + '/route/{id}',
        handler: ensureInitialized(function (request, h, respondWithConfig) {
            const id = request.params.id;
            const route = smocks.findRoute(id);
            return route_update_1.default(route, smocks)(request, h, respondWithConfig);
        })
    });
    server.route({
        method: 'POST',
        path: constants_1.MIDWAY_API_PATH + '/action',
        handler: ensureInitialized(function (request, h, respondWithConfig) {
            const id = request.params.id;
            const route = smocks.findRoute(id);
            execute_action_1.default(smocks)(request, h, respondWithConfig);
        })
    });
    server.route({
        method: 'POST',
        path: constants_1.MIDWAY_API_PATH + '/state/reset',
        handler: ensureInitialized(function (request, h, respondWithConfig) {
            reset_state_1.default(smocks)(request, h, respondWithConfig);
        })
    });
    server.route({
        method: "POST",
        path: constants_1.MIDWAY_API_PATH + "/sessionVariantState/reset",
        handler: ensureInitialized(function (request, h, respondWithConfig) {
            return reset_session_variant_state_1.default(smocks)(request, h, respondWithConfig);
        })
    });
    server.route({
        method: "POST",
        path: constants_1.MIDWAY_API_PATH + "/sessionVariantState/reset/{key}",
        handler: ensureInitialized(function (request, h, respondWithConfig) {
            return reset_session_variant_state_by_key_1.default(smocks)(request, h, respondWithConfig);
        })
    });
    server.route({
        method: "POST",
        path: constants_1.MIDWAY_API_PATH + "/sessionVariantState/set/{key}",
        handler: ensureInitialized(function (request, h, respondWithConfig) {
            return set_session_variant_state_by_key_1.default(smocks)(request, h, respondWithConfig);
        })
    });
    server.route({
        method: 'POST',
        path: constants_1.MIDWAY_API_PATH + '/input/reset',
        handler: ensureInitialized(function (request, h, respondWithConfig) {
            return reset_input_1.default(smocks)(request, h, respondWithConfig);
        })
    });
    server.route({
        method: 'GET',
        path: '/midway/lib/{name*}',
        handler: function (request, h) {
            try {
                const buffer = fs.readFileSync(__dirname + '/lib/' + request.params.name);
                const ext = path.extname(request.params.name);
                return h.response(buffer).header('Content-Type', MIME_TYPES[ext]).header('Cache-Control', 'max-age=31556926');
            }
            catch (e) {
                return h.response().code(404);
            }
        }
    });
    let compiledSource;
    server.route({
        method: 'GET',
        path: '/midway/app.js',
        handler: function (request, h) {
            if (!compiledSource) {
                const source = fs.readFileSync(__dirname + '/config-page.js', { encoding: 'utf-8' });
                compiledSource = require('babel-core').transform(source, { presets: [require('babel-preset-react')] }).code;
            }
            return compiledSource;
        }
    });
    server.route({
        method: 'GET',
        path: '/midway/inputs.js',
        handler: function (request, h) {
            return getInputPlugins(smocks);
        }
    });
};
function getInputPlugins(smocks) {
    const inputs = smocks.inputs.get();
    let script = '';
    _.each(inputs, function (data, id) {
        script = script + 'input["' + id + '"] = ' + data.ui + '\n';
    });
    script = 'var _inputs = function(input) {\n' + script + '\n};';
    return script;
}
//# sourceMappingURL=index.js.map