"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
it("should be able to read two or more variants", () => {
    const routesBefore = index_1.default.getRoute();
    expect(routesBefore).toHaveLength(0);
    index_1.default.route({
        id: 'POST /cardsvcs/acs/cardinventory/v1/digitalpayment/eligibility',
        label: '/cardsvcs/acs/cardinventory/v1/digitalpayment/eligibility',
        path: '/cardsvcs/acs/cardinventory/v1/digitalpayment/eligibility',
        method: 'POST',
        handler(req, reply) {
            const headers = {};
            const code = 200;
            return index_1.default.util.respondWithFile(this, reply, { code, headers });
        }
    })
        .variant({
        id: 'first-variant',
        handler(req, reply) {
            return index_1.default.util.respondWithFile(this, reply, { code: 200 });
        }
    })
        .variant({
        id: 'second-variant',
        handler(req, reply) {
            return index_1.default.util.respondWithFile(this, reply, { code: 200 });
        }
    }).variant({
        id: 'third-variant',
        handler(req, reply) {
            return index_1.default.util.respondWithFile(this, reply, { code: 200 });
        }
    });
    const routesAfter = index_1.default.getRoute();
    expect(routesAfter).toHaveLength(1);
    expect(routesAfter[0]._orderedVariants).toHaveLength(4);
    expect(routesAfter[0]._orderedVariants[0]._id).toBe('default');
    expect(routesAfter[0]._orderedVariants[1]._id).toBe('first-variant');
    expect(routesAfter[0]._orderedVariants[2]._id).toBe('second-variant');
    expect(routesAfter[0]._orderedVariants[3]._id).toBe('third-variant');
});
//# sourceMappingURL=midway-routes-two-test.js.map