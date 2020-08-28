"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const smocks_1 = require("../../smocks");
it("should be able to add global variants", () => {
    index_1.default.addGlobalVariant({
        id: "500",
        label: "500 error",
        handler(request, h) {
            return h.response({
                statusCode: 500,
                error: "Internal Server Error"
            }).code(500);
        }
    });
    expect(true).toBe(true);
});
it("should be able to add profile", () => {
    const profileName = "OOB Success Bank Login";
    const profileObject = { "GET /api/auth/oob/status": { activeVariant: "OOB Success" } };
    index_1.default.profile(profileName, profileObject);
    expect(smocks_1.default.profiles.get()).toEqual({ [profileName]: profileObject });
});
//# sourceMappingURL=midway-utils.js.map