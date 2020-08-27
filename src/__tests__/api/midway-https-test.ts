const midway = require('../../index');
import * as SuperTestRequest from "supertest";
import * as path from 'path';
import { appRoot, resourcesPath } from '../../utils/pathHelpers';
import * as util from 'util';

const setMockVariant = util.promisify(midway.setMockVariant);

describe('Midway Server', function () {
    let myServer;
    let request: SuperTestRequest.SuperTest<SuperTestRequest.Test>;
    beforeEach((done) => {
        // const mockedDirectory = path.join(resourcesPath, 'caribou-mocked-data');
        const mockedDirectory = path.join(resourcesPath, 'upgrade-mocked-data');
        // Call this to import all routes
        require(mockedDirectory);
        midway.start({
            port: 3000,
            // httpsPort: 4444,
            mockedDirectory,
            // sessions: 2,
        }, server => {
            myServer = server;
            request = SuperTestRequest('http://localhost:3000');
            done();
        });
    });
    afterEach(() => {
        midway.stop(myServer);
    });
    it('should be able to read valid endpoint', async () => {
        // console.log("URl count: ", midway.getURLCount());
        const result = await request.get('/portal');
        expect(result.status).toBe(200);
    });
    it('should get 404 on made up endpoint', async () => {
        // console.log("URl count: ", midway.getURLCount());
        const result = await request.get('/portal-not-a-real-endpoint');
        expect(result.status).toBe(404);
    });
    it('variants should return different results', async () => {
        // console.log("URl count: ", midway.getURLCount());
        const result = await request.post('/portal');
        expect(result.status).toBe(200);
        await setMockVariant({
            mockPort: 3000,
            fixture: 'POST /portal',
            variant: 'Bank-OOB'
        });
        const result2 = await request.post('/portal');
        expect(result2.status).toBe(401);
    });
    it('should read 240 routes for use in admin interface', async () => {
        const result = await request.get('/midway-data');
        // True while test data doesn't changae
        expect(result.body.routes).toHaveLength(240);
    });
    it('should read desired response body from endpoint', async () => {
        const result = await request.get('/portal');
        expect(result.body.cardAccounts).toHaveLength(1);
    });
});