"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("./upgrade-mocked-data");
const __1 = require("..");
const util = require("util");
const path = require("path");
const pathHelpers_1 = require("../utils/pathHelpers");
const setMockVariantWithSession = util.promisify(__1.default.setMockVariantWithSession);
const resetMockVariantWithSession = util.promisify(__1.default.resetMockVariantWithSession);
function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const mockedDirectory = path.join(pathHelpers_1.resourcesPath, 'upgrade-mocked-data');
        __1.default.start({
            port: 8001,
            mockedDirectory,
        });
        console.log('1');
        console.log('4');
    });
}
main();
//# sourceMappingURL=run-mock-server.js.map