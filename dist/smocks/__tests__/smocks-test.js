"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const index_2 = require("../index");
it('should confirm smocks are same instance', () => {
    expect(index_1.default).toBe(index_1.default);
});
it('should confirm smocks are same instance', () => {
    expect(index_2.default).toBe(index_1.default);
});
//# sourceMappingURL=smocks-test.js.map