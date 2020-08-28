
import midway from '../../index';
import smocks from '../../smocks';

it("should be able to add global variants", () => {
    midway.addGlobalVariant({
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
    midway.profile(profileName, profileObject);
  expect(smocks.profiles.get()).toEqual({ [profileName]: profileObject });
});