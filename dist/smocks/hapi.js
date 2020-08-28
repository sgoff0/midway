"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("./index");
const index_2 = require("./admin/index");
const _ = require("lodash");
const Hapi = require("@hapi/hapi");
const Logger = require("testarmada-midway-logger");
const _inputs = {
    boolean: require('./admin/api/input-plugins/checkbox'),
    text: require('./admin/api/input-plugins/text'),
    select: require('./admin/api/input-plugins/select'),
    multiselect: require('./admin/api/input-plugins/multiselect')
};
const defaultSmocksOptions = {
    state: undefined,
};
const defaultHapiPluginOptions = {
    onRegister: undefined
};
exports.default = {
    toPlugin: function (smocksOptions = defaultSmocksOptions) {
        return {
            name: 'smocks-plugin',
            version: '2.0.0',
            register: function (server, options) {
                index_1.default._sanityCheckRoutes();
                smocksOptions = index_1.default._sanitizeOptions(smocksOptions);
                index_1.default.initOptions = index_1.default.options = smocksOptions;
                index_1.default.state = smocksOptions.state;
                configServer(server);
            }
        };
    },
    start: (hapiOptions, smocksOptions) => {
        if (!index_1.default.id()) {
            throw new Error('You must set an id value for the smocks instance... smocks.id("my-project")');
        }
        hapiOptions = hapiOptions || {};
        const hapiServerOptions = hapiOptions.server;
        let hapiConnectionOptions = hapiOptions.connection;
        if (!hapiServerOptions && !hapiConnectionOptions) {
            hapiConnectionOptions = hapiOptions;
        }
        smocksOptions = index_1.default._sanitizeOptions(smocksOptions || {});
        index_1.default.state = smocksOptions.state;
        index_1.default.initOptions = smocksOptions;
        index_1.default._sanityCheckRoutes();
        if (!hapiConnectionOptions.routes) {
            hapiConnectionOptions.routes = { cors: true };
        }
        const server = new Hapi.Server(Object.assign(Object.assign({}, hapiServerOptions), hapiConnectionOptions));
        configServer(server);
        server.start();
        Logger.info('started smocks server on ' + hapiConnectionOptions.port + '.  visit http://localhost:' + hapiConnectionOptions.port + '/midway to configure');
        return {
            server: server,
            start: (options) => {
                this.start(options);
            }
        };
    }
};
function configServer(server) {
    index_1.default.input = function (type, options) {
        _inputs[type] = options;
    };
    index_1.default.inputs = {
        get: function () {
            return _inputs;
        }
    };
    const _routes = index_1.default.routes.get();
    _.each(_routes, (route) => {
        if (route.hasVariants()) {
            server.route({
                method: route.method(),
                path: route.path(),
                handler: function (request, h) {
                    return tslib_1.__awaiter(this, void 0, void 0, function* () {
                        function doInit() {
                            Logger.debug("doInit Hapi");
                            _.each(_routes, function (route) {
                                route.resetRouteVariant(request);
                                route.resetSelectedInput(request);
                            });
                            const initialState = JSON.parse(JSON.stringify(index_1.default.initOptions.initialState || {}));
                            index_1.default.state.resetUserState(request, initialState);
                        }
                        const shouldPerformInitialization = index_1.default.state.initialize(request);
                        if (shouldPerformInitialization) {
                            doInit();
                        }
                        return yield route._handleRequest(request, h);
                    });
                }
            });
        }
    });
    index_2.default(server, index_1.default);
}
//# sourceMappingURL=hapi.js.map