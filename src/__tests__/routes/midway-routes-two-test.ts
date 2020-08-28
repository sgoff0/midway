import midway from '../../index';

// TODO figure out how to completely reset midway, i can't have multiple tests in one file as adding routes pollutes scope
it("should be able to read two or more variants", () => {
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
    })
    .variant({
        id: 'first-variant',
        handler(req, reply) {
            return midway.util.respondWithFile(this, reply, { code: 200 });
        }
    })
    .variant({
        id: 'second-variant',
        handler(req, reply) {
            return midway.util.respondWithFile(this, reply, { code: 200 });
        }
    }).variant({
        id: 'third-variant',
        handler(req, reply) {
            return midway.util.respondWithFile(this, reply, { code: 200 });
        }
    });
    const routesAfter = midway.getRoute();
    expect(routesAfter).toHaveLength(1);
    // expect(routesAfter[0].getVariant()).toHaveLength(3);
    expect(routesAfter[0]._orderedVariants).toHaveLength(4);
    expect(routesAfter[0]._orderedVariants[0]._id).toBe('default');
    expect(routesAfter[0]._orderedVariants[1]._id).toBe('first-variant');
    expect(routesAfter[0]._orderedVariants[2]._id).toBe('second-variant');
    expect(routesAfter[0]._orderedVariants[3]._id).toBe('third-variant');
});