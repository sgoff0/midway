import midway from '../../index';

it("should be able to read variant when only one", () => {
    const routesBefore = midway.getRoute();
    expect(routesBefore).toHaveLength(0);
    midway.route({
        id: 'POST /cardsvcs/acs/cardinventory/v1/digitalpayment/eligibility',
        label: '/cardsvcs/acs/cardinventory/v1/digitalpayment/eligibility',
        path: '/cardsvcs/acs/cardinventory/v1/digitalpayment/eligibility',
        method: 'POST',
        handler(req, reply) {
            const headers = {};
            const code = 200;
            return midway.util.respondWithFile(this, reply, { code, headers });
        }
    }).variant({
        id: 'paypal-eligible-linked-not-enrolled',
        label: 'paypal-eligible-linked-not-enrolled',
        handler(req, reply) {
            return midway.util.respondWithFile(this, reply, { code: 200 });
        }
    });
    const routesAfter = midway.getRoute();
    expect(routesAfter).toHaveLength(1);
    expect(routesAfter[0]._orderedVariants[0]._id).toBe('default');
    expect(routesAfter[0]._orderedVariants[1]._id).toBe('paypal-eligible-linked-not-enrolled');
});