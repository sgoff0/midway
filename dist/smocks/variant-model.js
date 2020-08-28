"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const mimeTypes = require('mime-types');
const fs = require("fs");
const Path = require("path");
const util = require("util");
const index_1 = require("./index");
const readFile = util.promisify(fs.readFile);
class Variant {
    constructor(data = {}, route) {
        this.id = () => {
            return this._id;
        };
        this.label = (label) => {
            if (label) {
                this._label = label;
                return this;
            }
            else {
                return this._label;
            }
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
        this.respondWith = (handler) => {
            this.handler = handler;
            this.done();
            return this;
        };
        this.respondWithFile = (options) => {
            return this.respondWith((request, h) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                options = options || {};
                if (_.isString(options)) {
                    options = {
                        path: options
                    };
                }
                if (options.path) {
                    const path = Path.resolve(options.path.replace(/\{([^\}]+)\}/g, (match, token) => {
                        let val = request.params[token];
                        if (!val) {
                            val = this.state(token);
                        }
                        return val || match;
                    }));
                    try {
                        const stream = yield readFile(path, 'utf-8');
                        const mimeType = mimeTypes.lookup(path);
                        return h.response(stream).type(mimeType).code(options.code || 200);
                    }
                    catch (err) {
                        if (err.code === 'ENOENT') {
                            return h.response(path + ' not found').code(404);
                        }
                        else {
                            return err;
                        }
                    }
                }
                else {
                    const initOptions = index_1.default.initOptions;
                    const handlerFunction = initOptions.respondWithFileHandler;
                    if (!handlerFunction) {
                        return h.response({
                            message: 'no file handler function (use smocks "replyWithFileHandler" option)'
                        }).code(500);
                    }
                    handlerFunction({
                        request: request,
                        h: h,
                        route: this._route,
                        variant: this,
                        options: options,
                        smocksOptions: initOptions
                    });
                }
            }));
            return this.respondWith((request, reply) => {
                console.error("Commented out code here around filename");
                throw new Error("TODO sgoff0 where does filename come from?");
            });
        };
        this.variant = (...args) => {
            return this._route.variant.call(this._route, ...args);
        };
        this.route = (...args) => {
            return this._route.route.call(this._route, ...args);
        };
        this.done = () => {
            this._route.done();
        };
        this._id = data.id || 'default';
        this._label = data.label;
        this.handler = data.handler;
        this._route = route;
        this._input = data.input;
        this.appliesToRoute = data.appliesToRoute;
    }
}
exports.default = Variant;
//# sourceMappingURL=variant-model.js.map