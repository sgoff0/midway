"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resourcesPath = exports.appRoot = void 0;
const path = require("path");
exports.appRoot = path.resolve(__dirname, '../..');
exports.resourcesPath = path.resolve(exports.appRoot, 'src', 'resources');
//# sourceMappingURL=pathHelpers.js.map