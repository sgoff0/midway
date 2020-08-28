"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const hapi_1 = require("../smocks/hapi");
const HapiSwagger = require("hapi-swagger");
const Inert = require("@hapi/inert");
const Vision = require("@hapi/vision");
const Logger = require("testarmada-midway-logger");
exports.default = {
    runHapiWithPlugins: function (server, midwayOptions) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            Logger.info("Midway options: ", midwayOptions);
            server.midwayOptions = midwayOptions;
            yield registerMidwayPlugin(server);
        });
    }
};
const swaggerOptions = {
    info: {
        title: 'Midway API Documentation',
        version: require('./../../package.json').version
    },
    documentationPath: '/midway_api_doc'
};
function registerMidwayPlugin(server) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const smocksPlugin = hapi_1.default.toPlugin(server.midwayOptions);
        yield server.register([
            {
                plugin: Inert
            },
            {
                plugin: Vision
            },
            {
                plugin: smocksPlugin
            },
            {
                plugin: HapiSwagger,
                options: swaggerOptions
            }
        ]);
    });
}
//# sourceMappingURL=midway-plugin-controller.js.map