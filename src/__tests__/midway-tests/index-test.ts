// var midway = require('../../index');
// var Constants = require('../../lib/constants');
// require('../../resources/run-mock-server-api-dynamic.js');

import midway from "../..";
import Route from '../../smocks/route-model';

describe('index-tests', function () {

    it('Verify if no ID is passed, Midway server returns undefined', function () {
        const id = midway.id();
        expect(id).toBe(undefined);
    });

    it.skip('Verify if ID is passed, Midway server returns that ID', function () {
        const midwayServerObject = midway.id('test');
        expect(midwayServerObject).toBe('example');
    });

    // it.skip('Verify Midway is started on default parameters if options is undefined', asy () {
    //     const server = await midway.start(undefined);
    // });


    // Route is being added
    it.skip('Verify routes cannot be added if server is running', async () => {
        const server = await midway.start(undefined);
        midway.route({
            id: 'testRouteAddServerRunning',
            label: 'Add State',
            path: '/routeAdd',
            handler: function (req, h) {
                return "test";
            }
        });

        let routeFound = false;
        (midway.getRoute() as Route[]).forEach(route => {
            if (route._id === 'testRouteAddServerRunning') {
                console.log("Found test route");
                routeFound = true;
            }
        });
        expect(routeFound).toBe(false);
        await midway.stop();
    });

    it('Verify getRoute returns routes', function () {
        midway.route({
            id: 'testRouteGetRoute',
            label: 'Testing getRoute',
            path: '/testRouteGetRoute',
            handler: () => { return ""; }
        });

        expect((midway.getRoute('testRouteGetRoute') as Route).id()).toBe('testRouteGetRoute');
        expect(midway.getRoute('testRouteBadGetRoute')).toBe(undefined);
    });
});
